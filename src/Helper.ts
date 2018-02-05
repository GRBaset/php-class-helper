import { TextEditor, Position, commands, SymbolInformation, SymbolKind, SnippetString, Range, Selection, window, TextEditorRevealType, workspace } from 'vscode';
import { log } from 'util';


function empty(collection: any[]) {
    return !collection.length
}

function has(collection: any[]) {
    return !empty(collection);
}

export class Helper {
    editor: TextEditor;
    cursor: Position;

    symbols: SymbolInformation[];
    selections: Selection[];
    activeClass: SymbolInformation;
    construct: SymbolInformation;
    id = 1;

    placeholder = 'PROPERTY' + this.id;
    visibility: string;

    async addMethodCommand(editor, cursor, isPrivate = false) {
        this.editor = editor;
        this.cursor = cursor;

        this.symbols = await this.getSymbols(this.editor.document);
        let regExClass = this.getRegExClass();
        if (empty(this.symbols) && has(regExClass)) {
            window.showInformationMessage('PHP Class Helper - Pleas wait a couple of seconds');
            return;
        }

        this.activeClass = this.getClass();
        if (!this.activeClass) {
            this.addClass();
            return;
        }

        this.addMethod(isPrivate);
    }

    addMethod(isPrivate = false) {
        console.log(this.symbols);
        let visibility = isPrivate ? '\tprivate' : '\tpublic';
        let text = visibility + ' function ${1:functionName}($2) \n\t{\n\t\t$3\n\t}$0\n';

        let firstPrivateMetod = this.getFirstPrivateMethod();
        let position;

        if (firstPrivateMetod && !isPrivate) {
            let { line } = firstPrivateMetod.location.range.start;
            position = new Position(line, 0);
            text = text + "\n";
        } else {
            let { line, character } = this.activeClass.location.range.end;
            text = "\n" + text;
            position = new Position(line, character - 1);
        }

        let snippet = new SnippetString(text);
        this.editor.insertSnippet(snippet, position);
        this.scrollIntoView(position);
    }

    getFirstPrivateMethod(): SymbolInformation {
        return this.symbols
            .filter(symbol => {
                if (symbol.kind === SymbolKind.Method) {
                    let { range } = symbol.location;
                    return this.findRegExInRange(/\s*private\s*function/, range);
                }
            }).shift();
    }

    async run(editor, cursor) {
        this.editor = editor;
        this.cursor = cursor;
        this.selections = [];
        this.loadSettings();

        this.symbols = await this.getSymbols(this.editor.document);
        let regExClass = this.getRegExClass();
        if (empty(this.symbols) && has(regExClass)) {
            window.showInformationMessage('PHP Class Helper - Pleas wait a couple of seconds');
            return;
        }

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

    loadSettings() {
        let config = workspace.getConfiguration('php-class-helper');
        this.visibility = config.get('visibility', 'private');
    }

    getRegExClass() {
        let start = new Position(0, 0);
        let end = new Position(
            this.editor.document.lineCount - 1,
            0
        );
        let range = new Range(start, end);
        let classR = this.findAllCharacters('class', range);
        return classR;

    }

    getClass(): SymbolInformation {
        return this.symbols
            .filter(symbol => symbol.kind === SymbolKind.Class)
            .find((classSymbol) => {
                let { start, end } = classSymbol.location.range;
                return start.isBefore(this.cursor) && end.isAfter(this.cursor);
            });
    }

    addClass() {
        let snippet = new SnippetString('class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0');
        this.editor.insertSnippet(snippet, this.cursor);

        this.scrollIntoView(this.cursor);
    }

    getConstructor() {
        return this.getSymbolsInSymbol(this.activeClass).find((classSymbol) => {
            return classSymbol.kind == SymbolKind.Constructor;
        });
    }

    addConstructor() {
        let text = '\n\tpublic function __construct()\n\t{\n\t}';
        let properties = this.getProperties();

        let position;

        if (empty(properties)) {
            // add constructor at the begging of a class
            let classRange = this.activeClass.location.range;
            let openBracket: Position = this.findCharacter('{', classRange, true);
            position = openBracket;
        } else {
            // add constructor after last property;
            text = '\n' + text;
            let lastProperty: Position = properties.pop().location.range.end;
            position = new Position(
                lastProperty.line,
                lastProperty.character + 1
            );
        }

        this.editor.edit(edit => {
            edit.insert(position, text);
        });

        this.scrollIntoView(position);
    }

    async addVariables() {
        let property: [Position, string] = this.addProperty();
        let attribute: [Position, string] = this.addAttribute();
        let assigment: [Position, string] = this.addAssignment();

        await this.editor.edit((edit) => {
            edit.insert(property[0], property[1]);
            edit.insert(attribute[0], attribute[1]);
            edit.insert(assigment[0], assigment[1]);
        })

        this.scrollIntoView(assigment[0]);
    }

    getProperties(): SymbolInformation[] {
        return this.getSymbolsInSymbol(this.activeClass)
            .filter(symbol => symbol.kind === SymbolKind.Property);
    }

    addProperty(): [Position, string] {
        let staticText = '\n\t' + this.visibility + " $";
        let text = staticText + this.placeholder + ';';
        let properties = this.getProperties();

        let position;

        if (empty(properties)) {
            // add property at the begging of a class
            let classRange = this.activeClass.location.range;
            let openBracket = this.findCharacter('{', classRange, true);

            text += '\n';
            position = openBracket;
        } else {
            // add property after last property;
            let lastProperty: Position = properties.pop().location.range.end;
            position = new Position(
                lastProperty.line,
                lastProperty.character + 1
            );
        }

        return [position, text];
    }

    getAttributes() {
        let constructorRange = this.construct.location.range;
        let openingBracket = this.findCharacter('(', constructorRange, true);
        let closingBracket = this.findCharacter(')', constructorRange);
        let range = new Range(openingBracket, closingBracket)

        return this.getSymbolsInSymbol(this.construct)
            .filter(symbol => symbol.kind === SymbolKind.Variable && symbol.location.range.intersection(range))
    }

    addAttribute(): [Position, string] {
        let text = '$' + this.placeholder;

        let constructorRange = this.construct.location.range;
        let openingBracket = this.findCharacter('(', constructorRange, true);
        let closingBracket = this.findCharacter(')', constructorRange);
        let isMultilineConstructor = openingBracket.line !== closingBracket.line;

        let attributes = this.getAttributes();
        let lastAttribute = [...attributes].pop();

        let position = closingBracket;

        if (isMultilineConstructor) {
            if (has(attributes)) {
                position = this.findRegExInRange(
                    /\s*\$\w*[^,]\s*$/g,
                    new Range(openingBracket, closingBracket)
                );

                if (position.line == closingBracket.line || position.line == openingBracket.line) {
                    position = lastAttribute.location.range.end;
                    text = ',\n\t\t' + text + '\n\t';
                } else {
                    text = ',\n\t\t' + text;
                }
            } else {
                text = '\t' + text + '\n\t';
            }

        } else {
            if (has(attributes)) {
                text = ', ' + text;
            }
        }

        return [position, text];
    }

    addAssignment(): [Position, string] {
        let text = '\t$this->' + this.placeholder + ' = $' + this.placeholder + ';\n\t';

        let constructorRange = this.construct.location.range;
        let closingBracket = this.findCharacter('}', constructorRange);
        let openingBracket = this.findCharacter('{', constructorRange, true);

        let position = new Position(
            closingBracket.line,
            closingBracket.character
        );

        return [position, text];

    }

    getSelections() {
        let classRange = this.activeClass.location.range;

        let selectionPositions = this.findAllCharacters(this.placeholder,
            classRange
        );

        let lastSelection: Position = [...selectionPositions].pop();
        let propertySelection = new Position(
            lastSelection.line,
            lastSelection.character + this.placeholder.length + 4
        );

        selectionPositions.push(propertySelection)

        return selectionPositions.map(selection => {
            return new Selection(
                new Position(selection.line, selection.character),
                new Position(selection.line, selection.character + this.placeholder.length)
            )
        })
    }

    selectProperties() {
        this.selections = this.getSelections();
        this.editor.selections = this.selections;
    }

    getSymbols(document) {
        return commands.executeCommand<SymbolInformation[]>('vscode.executeDocumentSymbolProvider', document.uri);
    }

    getSymbolsInSymbol({ name, containerName, kind }: SymbolInformation): SymbolInformation[] {
        if (kind == SymbolKind.Class) {
            containerName = containerName
                ? containerName.concat('\\', name)
                : name;
        } else {
            containerName = name
        }

        return this.symbols.filter((symbol: SymbolInformation) => {
            return symbol.containerName == containerName;
        });
    }

    async updateSymbols(document) {
        this.symbols = await this.getSymbols(document);
        this.activeClass = this.getClass();
        this.construct = this.getConstructor();
    }

    updatePlaceholderName() {
        this.id++;
        this.placeholder = 'PROPERTY' + this.id;
    }

    findCharacter(character: string, range: Range, endPosition: boolean = false): Position {
        let currentLine = range.start.line;
        let endLine = range.end.line;
        while (currentLine <= endLine) {
            let characterIndex = this.editor.document.lineAt(currentLine).text.indexOf(character);
            if (characterIndex !== -1) return new Position(
                currentLine,
                endPosition ? characterIndex + 1 : characterIndex
            );

            currentLine++;
        }
        return undefined;
    }

    findAllCharacters(character: string, range: Range): Position[] {
        let characters: Position[] = [];
        let currentLine = range.start.line;
        let endLine = range.end.line;
        while (currentLine <= endLine) {
            let characterIndex = this.editor.document.lineAt(currentLine).text.indexOf(character);
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

    findRegExInRange(regex: RegExp, range: Range): Position {
        let characterIndex;
        let currentLine = range.start.line;
        let endLine = range.end.line;
        while (currentLine <= endLine) {
            characterIndex = this.editor.document.lineAt(currentLine).text.match(regex);

            if (characterIndex !== null) return new Position(currentLine, characterIndex[0].length);

            currentLine++;
        }
        return undefined;
    }

    scrollIntoView(position: Position) {
        let range = new Range(position, position);
        this.editor.revealRange(range, TextEditorRevealType.InCenter);
    }
}