import { Position, SnippetString, SymbolInformation, SymbolKind, TextEditor } from "vscode";
import { scrollIntoView } from "../helpers";
import { SymbolService } from "../services/SymbolService";

export class Class {
    constructor(private symbolService: SymbolService) { }

    /**
     * getClass
     */
    public getClassByCursor(position: Position): SymbolInformation {
        return this.symbolService.symbols
            .filter((symbol) => symbol.kind === SymbolKind.Class)
            .find((classSymbol) => {
                const { start, end } = classSymbol.location.range;
                return start.isBefore(position) && end.isAfter(position);
            });
    }

    public addClass(editor: TextEditor, position: Position): void {
        const snippet = new SnippetString("class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0");
        editor.insertSnippet(snippet, position);

        scrollIntoView(editor, position);
    }
}
