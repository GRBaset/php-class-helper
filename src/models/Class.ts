import { SnippetString, SymbolInformation, SymbolKind } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { scrollIntoView } from "../helpers";
import { SymbolService } from "../services/SymbolService";

export class Class {
    /**
     * Active class symbol.
     */
    public static active: SymbolInformation;

    constructor() {
        this.getByCursor();
    }

    /**
     * Get the class under cursor
     */
    public getByCursor(): SymbolInformation {
        Class.active = SymbolService.active
            .filter((symbol) => symbol.kind === SymbolKind.Class)
            .find((classSymbol) => {
                const { start, end } = classSymbol.location.range;
                return start.isBefore(ClassHelper.cursor) && end.isAfter(ClassHelper.cursor);
            });

        return Class.active;
    }

    /**
     * Add a class snippet at the current cursor position
     */
    public add(): void {
        const snippet = new SnippetString("class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0");
        ClassHelper.editor.insertSnippet(snippet, ClassHelper.cursor);

        scrollIntoView(ClassHelper.cursor);
    }
}
