import { TextEditor, Position, commands, SymbolInformation, SymbolKind, SnippetString, Range, Selection, window, TextEditorRevealType } from 'vscode';
import { log } from 'util';


function empty(collection: any[]) {
    return !collection.length
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
    visibility = 'private';

    async run(editor, cursor) {
        this.editor = editor;
        this.cursor = cursor;
        this.selections = [];


        this.symbols = await this.getSymbols(this.editor.document);
        if (empty(this.symbols)) {
            window.showInformationMessage('PHP class helper - symbols are not loaded. Please wait a couple of second for visual studio to load the symbols.');
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

        await this.updateSymbols();

        this.select();

        this.updatePlaceholderName();
    }

    async updateSymbols() {
        this.symbols = await this.getSymbols(this.editor.document);
        this.activeClass = this.getClass();
        this.construct = this.getConstructor();
    }

    scrollIntoView(position: Position) {
        let range = new Range(position, position);
        this.editor.revealRange(range, TextEditorRevealType.InCenter);
    }
    updatePlaceholderName() {
        this.id++;
        this.placeholder = 'PROPERTY' + this.id;
    }

    select() {
        this.selections = this.getSelections();
        this.editor.selections = this.selections;
    }

    getSelections() {
        let classRange = this.activeClass.location.range;
        //cant use active clase range, because the range is sometimes incorect
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

    addAttribute(): [Position, string] {
        let text = '$' + this.placeholder;

        let constructorRange = this.construct.location.range;
        let openingBracket = this.findCharacter('(', constructorRange, true);
        let closingBracket = this.findCharacter(')', constructorRange);
        let isMultilineConstructor = openingBracket.line !== closingBracket.line;

        let attributes = this.findAttributes();

        let position = closingBracket;

        if (isMultilineConstructor) {
            if (empty(attributes)) {
                console.log('not handled');

            } else {
                position = this.findRegExInRange(
                    /\s*\$\w*[^,]\s*$/g,
                    new Range(openingBracket, closingBracket)
                );

                text = ',\n\t\t' + text;
            }
        } else {
            if (!empty(attributes)) {
                text = ', ' + text;
            }
        }

        return [position, text];
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

    findAttributes() {
        let constructorRange = this.construct.location.range;
        let openingBracket = this.findCharacter('(', constructorRange, true);
        let closingBracket = this.findCharacter(')', constructorRange);
        let range = new Range(openingBracket, closingBracket)

        return this.getSymbolsInSymbol(this.construct)
            .filter(symbol => symbol.kind === SymbolKind.Variable && symbol.location.range.intersection(range))
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



    addConstructor() {
        let text = '\n\tpublic function __construct()\n\t{\n\n\t}\n';
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

    getProperties(): SymbolInformation[] {
        return this.getSymbolsInSymbol(this.activeClass)
            .filter(symbol => symbol.kind === SymbolKind.Property);
    }

    getConstructor() {
        return this.getSymbolsInSymbol(this.activeClass).find((classSymbol) => {
            return classSymbol.kind == SymbolKind.Constructor;
        });
    }

    addClass() {
        let snippet = new SnippetString('class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0');
        this.editor.insertSnippet(snippet, this.cursor);

        this.scrollIntoView(this.cursor);
    }

    getClass(): SymbolInformation {
        return this.symbols
            .filter(symbol => symbol.kind === SymbolKind.Class)
            .find((classSymbol) => {
                let { start, end } = classSymbol.location.range;
                return start.isBefore(this.cursor) && end.isAfter(this.cursor);
            });
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

}