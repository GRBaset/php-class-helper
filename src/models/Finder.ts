import { Range, Position, TextDocument } from "vscode";

export class Finder {

    private document: TextDocument;

    constructor(document: TextDocument) {
        this.document = document;
    }

    findCharacter(character: string, range: Range, endPosition: boolean = false): Position {
        let currentLine = range.start.line;
        let endLine = range.end.line;
        while (currentLine <= endLine) {
            let characterIndex = this.document.lineAt(currentLine).text.indexOf(character);
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
            let characterIndex = this.document.lineAt(currentLine).text.indexOf(character);
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
            characterIndex = this.document.lineAt(currentLine).text.match(regex);

            if (characterIndex !== null) return new Position(currentLine, characterIndex[0].length);

            currentLine++;
        }
        return undefined;
    }
}