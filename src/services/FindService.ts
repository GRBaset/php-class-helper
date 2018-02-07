import { Position, Range, TextDocument } from "vscode";

export class FindService {

    public static document: TextDocument;

    public static findCharacter(character: string, range: Range, endPosition: boolean = false): Position {
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            const characterIndex = FindService.document.lineAt(currentLine).text.indexOf(character);
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

    public static findAllCharacters(character: string, range: Range): Position[] {
        const characters: Position[] = [];
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            const characterIndex = FindService.document.lineAt(currentLine).text.indexOf(character);
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

    public static findRegExInRange(regex: RegExp, range: Range): Position {
        let characterIndex;
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            characterIndex = FindService.document.lineAt(currentLine).text.match(regex);

            if (characterIndex !== null) {
                return new Position(currentLine, characterIndex[0].length);
            }

            currentLine++;
        }
        return undefined;
    }
}
