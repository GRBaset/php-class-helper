// tslint:disable-next-line:max-line-length
import { commands, Position, Range, Selection, SnippetString, SymbolInformation, SymbolKind, TextEditor, TextEditorRevealType, window, workspace } from "vscode";

import { empty, has, uppercaseFirst } from "./helpers";
import { SymbolService } from "./services/SymbolService";

export class Command {
    private editor: TextEditor;
    private cursor: Position;

    private symbolService: SymbolService;
    private symbols: SymbolInformation[];
    private selections: Selection[];
    private activeClass: SymbolInformation;
    private construct: SymbolInformation;
    private id = 1;

    private placeholder = "PROPERTY" + this.id;
    private visibility: string;

    public async addMethodCommand(editor, cursor, isPrivate = false) {
        this.editor = editor;
        this.cursor = cursor;

        this.symbolService = new SymbolService(this.editor.document);
        const ready = await this.symbolService.ready();

        if (!ready) {
            window.showInformationMessage("PHP Class Helper - Pleas wait a couple of seconds");
            return;
        }

        this.symbols = this.symbolService.symbols;

        this.activeClass = this.getClass();
        if (!this.activeClass) {
            this.addClass();
            return;
        }
        const property: SymbolInformation = this.getPropertyUnderCursor();

        if (property) {
            await this.addGetterAndSetter(property);
            return;
        }

        this.addMethod(isPrivate);
    }

    public async addConstructorCommand(editor, cursor) {
        this.editor = editor;
        this.cursor = cursor;
        this.selections = [];
        this.loadSettings();

        this.symbolService = new SymbolService(this.editor.document);
        const ready = await this.symbolService.ready();

        if (!ready) {
            window.showInformationMessage("PHP Class Helper - Pleas wait a couple of seconds");
            return;
        }

        this.symbols = this.symbolService.symbols;

        this.activeClass = this.getClass();
        if (!this.activeClass) {
            this.addClass();
            return;
        }

        this.construct = this.getConstructor();
        if (!this.construct) {
            this.addConstructor();
            return;
        }

        await this.addVariables();
        await this.updateSymbols(editor.document);

        this.selectProperties();
        this.updatePlaceholderName();
    }

    private async addGetterAndSetter(property: SymbolInformation) {
        let getter: string | null = this.addGetter(property);
        let setter: string | null = this.addSetter(property);

        let position: Position;

        this.construct = this.getConstructor();
        const lastProperty = this.getProperties().pop().location.range.end;

        if (getter) {
            getter = "\n\n" + getter;
        } else if (setter) {
            setter = "\n" + setter;
        }

        if (this.construct) {
            position = this.construct.location.range.end;
        } else {
            position = new Position(
                lastProperty.line,
                lastProperty.character + 1
            );
        }

        await this.editor.edit((edit) => {
            if (getter) {
                edit.insert(position, getter);
                window.setStatusBarMessage(`adding getter`, 3000);
            }
            if (setter) {
                edit.insert(position, setter);
                window.setStatusBarMessage(`adding setter`, 3000);
            }
            if (getter && setter) {
                window.setStatusBarMessage(`adding getter and setter`, 3000);
            }

        });
    }

    private addGetter(property: SymbolInformation, isPrivate = false) {
        const propName = property.name.slice(1);
        const functionName = `get${uppercaseFirst(propName)}`;

        const method = this.getMethod(functionName);
        if (method) {
            window.setStatusBarMessage(`method ${functionName} already exist`, 3000);
            return;
        }

        return `\tpublic function ${functionName}() \n\t{\n\t\treturn \$this->${propName};\n\t}\n`;
    }

    private addSetter(property: SymbolInformation, isPrivate = false) {
        const propName = property.name.slice(1);

        const functionName = `set${uppercaseFirst(propName)}`;

        const method = this.getMethod(functionName);
        if (method) {
            window.setStatusBarMessage(`method ${functionName} already exist`, 3000);
            return;
        }

        const text = `\n\tpublic function ${functionName}(${property.name})
            \n\t{\n\t\t\$this->${propName} = ${property.name};\n\t}`;

        return text;
    }

    private addMethod(isPrivate = false) {
        const visibility = isPrivate ? "\tprivate" : "\tpublic";
        let text = visibility + " function ${1:functionName}($2) \n\t{\n\t\t${3://not implemented}\n\t}$0\n";

        const firstPrivateMetod = this.getFirstPrivateMethod();
        let position;

        if (firstPrivateMetod && !isPrivate) {
            const { line } = firstPrivateMetod.location.range.start;
            position = new Position(line, 0);
            text = text + "\n";
        } else {
            const { line, character } = this.activeClass.location.range.end;
            text = "\n" + text;
            position = new Position(line, character - 1);
        }

        const snippet = new SnippetString(text);
        this.editor.insertSnippet(snippet, position);
        this.scrollIntoView(position);
    }

    private getMethods() {
        const activeClassMethods = this.symbolService.getSymbolsInSymbol(this.activeClass);

        return activeClassMethods
            .filter((symbol) => {
                return symbol.kind === SymbolKind.Method;
            });
    }

    private getMethod(propName) {
        const methods = this.getMethods();
        return methods.find((symbol) => {
            return symbol.name === propName;
        });
    }

    private getFirstPrivateMethod(): SymbolInformation {
        return this.symbols
            .filter((symbol) => {
                if (symbol.kind === SymbolKind.Method) {
                    const { range } = symbol.location;
                    return this.findRegExInRange(/\s*private\s*function/, range);
                }
            }).shift();
    }

    private loadSettings() {
        const config = workspace.getConfiguration("php-class-helper");
        this.visibility = config.get("visibility", "private");
    }

    private getClass(): SymbolInformation {
        return this.symbols
            .filter((symbol) => symbol.kind === SymbolKind.Class)
            .find((classSymbol) => {
                const { start, end } = classSymbol.location.range;
                return start.isBefore(this.cursor) && end.isAfter(this.cursor);
            });
    }

    private addClass() {
        const snippet = new SnippetString("class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0");
        this.editor.insertSnippet(snippet, this.cursor);

        this.scrollIntoView(this.cursor);
    }

    private getConstructor() {
        return this.symbolService.getSymbolsInSymbol(this.activeClass).find((classSymbol) => {
            return classSymbol.kind === SymbolKind.Constructor;
        });
    }

    private addConstructor() {
        let text = "\n\tpublic function __construct()\n\t{\n\t}";
        const properties = this.getProperties();

        let position;

        if (empty(properties)) {
            // add constructor at the begging of a class
            const classRange = this.activeClass.location.range;
            const openBracket: Position = this.findCharacter("{", classRange, true);
            position = openBracket;
        } else {
            // add constructor after last property;
            text = "\n" + text;
            const lastProperty: Position = properties.pop().location.range.end;
            position = new Position(
                lastProperty.line,
                lastProperty.character + 1
            );
        }

        this.editor.edit((edit) => {
            edit.insert(position, text);
        });

        this.scrollIntoView(position);
    }

    private async addVariables() {
        const property: [Position, string] = this.addProperty();
        const attribute: [Position, string] = this.addAttribute();
        const assigment: [Position, string] = this.addAssignment();

        await this.editor.edit((edit) => {
            edit.insert(property[0], property[1]);
            edit.insert(attribute[0], attribute[1]);
            edit.insert(assigment[0], assigment[1]);
        });

        this.scrollIntoView(assigment[0]);
    }

    private getProperties(): SymbolInformation[] {
        return this.symbolService.getSymbolsInSymbol(this.activeClass)
            .filter((symbol) => symbol.kind === SymbolKind.Property);
    }

    private getPropertyUnderCursor(): SymbolInformation {
        return this.getProperties().find((property) => {
            const { start, end } = property.location.range;

            return start.isBeforeOrEqual(this.cursor) && end.isAfterOrEqual(this.cursor);
        });
    }

    private addProperty(): [Position, string] {
        const staticText = "\n\t" + this.visibility + " $";
        let text = staticText + this.placeholder + ";";
        const properties = this.getProperties();

        let position;

        if (empty(properties)) {
            // add property at the begging of a class
            const classRange = this.activeClass.location.range;
            const openBracket = this.findCharacter("{", classRange, true);

            text += "\n";
            position = openBracket;
        } else {
            // add property after last property;
            const lastProperty: Position = properties.pop().location.range.end;
            position = new Position(
                lastProperty.line,
                lastProperty.character + 1
            );
        }

        return [position, text];
    }

    private getAttributes() {
        const constructorRange = this.construct.location.range;
        const openingBracket = this.findCharacter("(", constructorRange, true);
        const closingBracket = this.findCharacter(")", constructorRange);
        const range = new Range(openingBracket, closingBracket);

        return this.symbolService.getSymbolsInSymbol(this.construct)
            .filter((symbol) => symbol.kind === SymbolKind.Variable && symbol.location.range.intersection(range));
    }

    private addAttribute(): [Position, string] {
        let text = "$" + this.placeholder;

        const constructorRange = this.construct.location.range;
        const openingBracket = this.findCharacter("(", constructorRange, true);
        const closingBracket = this.findCharacter(")", constructorRange);
        const isMultilineConstructor = openingBracket.line !== closingBracket.line;

        const attributes = this.getAttributes();
        const lastAttribute = [...attributes].pop();

        let position = closingBracket;

        if (isMultilineConstructor) {
            if (has(attributes)) {
                position = this.findRegExInRange(
                    /\s*\$\w*[^,]\s*$/g,
                    new Range(openingBracket, closingBracket)
                );

                if (position.line === closingBracket.line || position.line === openingBracket.line) {
                    position = lastAttribute.location.range.end;
                    text = ",\n\t\t" + text + "\n\t";
                } else {
                    text = ",\n\t\t" + text;
                }
            } else {
                text = "\t" + text + "\n\t";
            }

        } else {
            if (has(attributes)) {
                text = ", " + text;
            }
        }

        return [position, text];
    }

    private addAssignment(): [Position, string] {
        const text = "\t$this->" + this.placeholder + " = $" + this.placeholder + ";\n\t";

        const constructorRange = this.construct.location.range;
        const closingBracket = this.findCharacter("}", constructorRange);
        const openingBracket = this.findCharacter("{", constructorRange, true);

        const position = new Position(
            closingBracket.line,
            closingBracket.character
        );

        return [position, text];

    }

    private getSelections() {
        const classRange = this.activeClass.location.range;

        const selectionPositions = this.findAllCharacters(this.placeholder,
            classRange
        );

        const lastSelection: Position = [...selectionPositions].pop();
        const propertySelection = new Position(
            lastSelection.line,
            lastSelection.character + this.placeholder.length + 4
        );

        selectionPositions.push(propertySelection);

        return selectionPositions.map((selection) => {
            return new Selection(
                new Position(selection.line, selection.character),
                new Position(selection.line, selection.character + this.placeholder.length)
            );
        });
    }

    private selectProperties() {
        this.selections = this.getSelections();
        this.editor.selections = this.selections;
    }

    private async updateSymbols(document) {
        this.symbols = await this.symbolService.getAll(document);
        this.activeClass = this.getClass();
        this.construct = this.getConstructor();
    }

    private updatePlaceholderName() {
        this.id++;
        this.placeholder = "PROPERTY" + this.id;
    }

    private findCharacter(character: string, range: Range, endPosition: boolean = false): Position {
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            const characterIndex = this.editor.document.lineAt(currentLine).text.indexOf(character);
            if (characterIndex !== -1) {
                return new Position(
                    currentLine,
                    endPosition ? characterIndex + 1 : characterIndex
                );
            }

            currentLine++;
        }
        return undefined;
    }

    private findAllCharacters(character: string, range: Range): Position[] {
        const characters: Position[] = [];
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            const characterIndex = this.editor.document.lineAt(currentLine).text.indexOf(character);
            if (characterIndex !== -1) {
                characters.push(
                    new Position(
                        currentLine,
                        characterIndex
                    )
                );
            }

            currentLine++;
        }
        return characters;
    }

    private findRegExInRange(regex: RegExp, range: Range): Position {
        let characterIndex;
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            characterIndex = this.editor.document.lineAt(currentLine).text.match(regex);

            if (characterIndex !== null) {
                return new Position(currentLine, characterIndex[0].length);
            }

            currentLine++;
        }
        return undefined;
    }

    private scrollIntoView(position: Position) {
        const range = new Range(position, position);
        this.editor.revealRange(range, TextEditorRevealType.InCenter);
    }
}
