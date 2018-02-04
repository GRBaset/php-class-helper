"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function empty(collection) {
    return !collection.length;
}
function has(collection) {
    return !empty(collection);
}
class Helper {
    constructor() {
        this.id = 1;
        this.placeholder = 'PROPERTY' + this.id;
    }
    run(editor, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            this.editor = editor;
            this.cursor = cursor;
            this.selections = [];
            this.loadSettings();
            this.symbols = yield this.getSymbols(this.editor.document);
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
            yield this.addVariables();
            yield this.updateSymbols();
            this.select();
            this.updatePlaceholderName();
        });
    }
    loadSettings() {
        let config = vscode_1.workspace.getConfiguration('php-class-helper');
        this.visibility = config.get('visibility', 'private');
    }
    updateSymbols() {
        return __awaiter(this, void 0, void 0, function* () {
            this.symbols = yield this.getSymbols(this.editor.document);
            this.activeClass = this.getClass();
            this.construct = this.getConstructor();
        });
    }
    scrollIntoView(position) {
        let range = new vscode_1.Range(position, position);
        this.editor.revealRange(range, vscode_1.TextEditorRevealType.InCenter);
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
        let selectionPositions = this.findAllCharacters(this.placeholder, classRange);
        let lastSelection = [...selectionPositions].pop();
        let propertySelection = new vscode_1.Position(lastSelection.line, lastSelection.character + this.placeholder.length + 4);
        selectionPositions.push(propertySelection);
        return selectionPositions.map(selection => {
            return new vscode_1.Selection(new vscode_1.Position(selection.line, selection.character), new vscode_1.Position(selection.line, selection.character + this.placeholder.length));
        });
    }
    findAllCharacters(character, range) {
        let characters = [];
        let currentLine = range.start.line;
        let endLine = range.end.line;
        while (currentLine <= endLine) {
            let characterIndex = this.editor.document.lineAt(currentLine).text.indexOf(character);
            if (characterIndex !== -1) {
                characters.push(new vscode_1.Position(currentLine, characterIndex));
            }
            currentLine++;
        }
        return characters;
    }
    addVariables() {
        return __awaiter(this, void 0, void 0, function* () {
            let property = this.addProperty();
            let attribute = this.addAttribute();
            let assigment = this.addAssignment();
            yield this.editor.edit((edit) => {
                edit.insert(property[0], property[1]);
                edit.insert(attribute[0], attribute[1]);
                edit.insert(assigment[0], assigment[1]);
            });
            this.scrollIntoView(assigment[0]);
        });
    }
    addAttribute() {
        let text = '$' + this.placeholder;
        let constructorRange = this.construct.location.range;
        let openingBracket = this.findCharacter('(', constructorRange, true);
        let closingBracket = this.findCharacter(')', constructorRange);
        let isMultilineConstructor = openingBracket.line !== closingBracket.line;
        let attributes = this.findAttributes();
        let lastAttribute = [...attributes].pop();
        let position = closingBracket;
        if (isMultilineConstructor) {
            if (has(attributes)) {
                position = this.findRegExInRange(/\s*\$\w*[^,]\s*$/g, new vscode_1.Range(openingBracket, closingBracket));
                if (position.line == closingBracket.line || position.line == openingBracket.line) {
                    position = lastAttribute.location.range.end;
                    text = ',\n\t\t' + text + '\n\t';
                }
                else {
                    text = ',\n\t\t' + text;
                }
            }
            else {
                text = '\t' + text + '\n\t';
            }
        }
        else {
            if (has(attributes)) {
                text = ', ' + text;
            }
        }
        return [position, text];
    }
    findRegExInRange(regex, range) {
        let characterIndex;
        let currentLine = range.start.line;
        let endLine = range.end.line;
        while (currentLine <= endLine) {
            characterIndex = this.editor.document.lineAt(currentLine).text.match(regex);
            if (characterIndex !== null)
                return new vscode_1.Position(currentLine, characterIndex[0].length);
            currentLine++;
        }
        return undefined;
    }
    findAttributes() {
        let constructorRange = this.construct.location.range;
        let openingBracket = this.findCharacter('(', constructorRange, true);
        let closingBracket = this.findCharacter(')', constructorRange);
        let range = new vscode_1.Range(openingBracket, closingBracket);
        return this.getSymbolsInSymbol(this.construct)
            .filter(symbol => symbol.kind === vscode_1.SymbolKind.Variable && symbol.location.range.intersection(range));
    }
    addAssignment() {
        let text = '\t$this->' + this.placeholder + ' = $' + this.placeholder + ';\n\t';
        let constructorRange = this.construct.location.range;
        let closingBracket = this.findCharacter('}', constructorRange);
        let openingBracket = this.findCharacter('{', constructorRange, true);
        let position = new vscode_1.Position(closingBracket.line, closingBracket.character);
        return [position, text];
    }
    addProperty() {
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
        }
        else {
            // add property after last property;
            let lastProperty = properties.pop().location.range.end;
            position = new vscode_1.Position(lastProperty.line, lastProperty.character + 1);
        }
        return [position, text];
    }
    addConstructor() {
        let text = '\n\tpublic function __construct()\n\t{\n\t}\n';
        let properties = this.getProperties();
        let position;
        if (empty(properties)) {
            // add constructor at the begging of a class
            let classRange = this.activeClass.location.range;
            let openBracket = this.findCharacter('{', classRange, true);
            position = openBracket;
        }
        else {
            // add constructor after last property;
            text = '\n' + text;
            let lastProperty = properties.pop().location.range.end;
            position = new vscode_1.Position(lastProperty.line, lastProperty.character + 1);
        }
        this.editor.edit(edit => {
            edit.insert(position, text);
        });
        this.scrollIntoView(position);
    }
    getProperties() {
        return this.getSymbolsInSymbol(this.activeClass)
            .filter(symbol => symbol.kind === vscode_1.SymbolKind.Property);
    }
    getConstructor() {
        return this.getSymbolsInSymbol(this.activeClass).find((classSymbol) => {
            return classSymbol.kind == vscode_1.SymbolKind.Constructor;
        });
    }
    addClass() {
        let snippet = new vscode_1.SnippetString('class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0');
        this.editor.insertSnippet(snippet, this.cursor);
        this.scrollIntoView(this.cursor);
    }
    getClass() {
        return this.symbols
            .filter(symbol => symbol.kind === vscode_1.SymbolKind.Class)
            .find((classSymbol) => {
            let { start, end } = classSymbol.location.range;
            return start.isBefore(this.cursor) && end.isAfter(this.cursor);
        });
    }
    getSymbols(document) {
        return vscode_1.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri);
    }
    getSymbolsInSymbol({ name, containerName, kind }) {
        if (kind == vscode_1.SymbolKind.Class) {
            containerName = containerName
                ? containerName.concat('\\', name)
                : name;
        }
        else {
            containerName = name;
        }
        return this.symbols.filter((symbol) => {
            return symbol.containerName == containerName;
        });
    }
    findCharacter(character, range, endPosition = false) {
        let currentLine = range.start.line;
        let endLine = range.end.line;
        while (currentLine <= endLine) {
            let characterIndex = this.editor.document.lineAt(currentLine).text.indexOf(character);
            if (characterIndex !== -1)
                return new vscode_1.Position(currentLine, endPosition ? characterIndex + 1 : characterIndex);
            currentLine++;
        }
        return undefined;
    }
}
exports.Helper = Helper;
//# sourceMappingURL=Helper.js.map