import { commands, Position, Range, SymbolInformation, SymbolKind, TextDocument } from "vscode";
import { Finder } from "../models/Finder";
import { empty, has, uppercaseFirst } from "./../helpers";

export class SymbolService {

    public symbols: SymbolInformation[];
    private document: TextDocument;

    private finder: Finder;

    constructor(document: TextDocument) {
        this.document = document;
        this.finder = new Finder(document);
    }

    public async ready() {
        this.symbols = await this.getAll(this.document);
        const classExist = this.classExist();

        return !(empty(this.symbols) && has(classExist));
    }
    /**
     * getSymbols
     */
    public getAll(document) {
        return commands.executeCommand<SymbolInformation[]>("vscode.executeDocumentSymbolProvider", document.uri);
    }

    public getSymbolsInSymbol({ name, containerName, kind }: SymbolInformation): SymbolInformation[] {
        if (kind === SymbolKind.Class) {
            containerName = containerName
                ? containerName.concat("\\", name)
                : name;
        } else {
            containerName = name;
        }

        return this.symbols.filter((symbol: SymbolInformation) => {
            return symbol.containerName === containerName;
        });
    }
    /**
     * getRegExClass
     */
    private classExist() {
        const start = new Position(0, 0);
        const end = new Position(
            this.document.lineCount - 1,
            0
        );
        const range = new Range(start, end);
        const foundClass = this.finder.findAllCharacters("class", range);
        return foundClass;

    }
}
