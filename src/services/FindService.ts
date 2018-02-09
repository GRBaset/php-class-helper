import { Position, Range, TextDocument } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { log } from "util";
import { start } from "repl";

export class FindService {

    /**
     * Find a Character Position.
     * @param character Search term
     * @param range Range
     * @param endPosition If true get the ending position of a character
     */
    public static findCharacter(character: string, range: Range, endPosition: boolean = false): Position {
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            const characterIndex = ClassHelper.document.lineAt(currentLine).text.indexOf(character);
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

    /**
     * Find all first character occurencess for each line in a document
     * @param character Search term
     * @param range Range
     */
    public static findAllCharacters(character: string, range: Range): Position[] {
        const characters: Position[] = [];
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            const characterIndex = ClassHelper.document.lineAt(currentLine).text.indexOf(character);
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

    /**
     * Find a position in a range, with a regex
     * @param regex Regular Expression
     * @param range Range
     */
    public static findRegExInRange(regex: RegExp, range: Range): Position {
        let characterIndex;
        let currentLine = range.start.line;
        const endLine = range.end.line;
        while (currentLine <= endLine) {
            characterIndex = ClassHelper.document.lineAt(currentLine).text.match(regex);

            if (characterIndex !== null) {
                return new Position(currentLine, characterIndex[0].length);
            }

            currentLine++;
        }
        return undefined;
    }

    public static findLastRegExInRange(regex: RegExp, range: Range): Position {
        let characterIndex;
        let currentLine = range.start.line;
        const endLine = range.end.line;
        const matches = [];
        while (currentLine <= endLine) {
            if (currentLine === range.start.line) {
                characterIndex = ClassHelper.document.getText(new Range(range.start, range.end)).match(regex);
            } else {
                characterIndex = ClassHelper.document.lineAt(currentLine).text.match(regex);
            }

            let includesBracket;
            if (ClassHelper.document.lineAt(currentLine).text.includes(")")) {
                includesBracket = true;
            }
            if (characterIndex !== null) {
                matches.push(new Position(
                    currentLine,
                    (currentLine === range.start.line ? characterIndex + range.start.character : 0)
                    + characterIndex[0].length +
                    Number(ClassHelper.editor.options.tabSize) +
                    Number(ClassHelper.editor.options.tabSize)
                    - (includesBracket ? 1 : 0)
                ));
            }

            currentLine++;
        }

        return matches.pop();
    }
}
