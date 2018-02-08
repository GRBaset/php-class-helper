import { commands, Position, Range, SymbolInformation, SymbolKind } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { Class } from "../models/Class";
import { Constructor } from "../models/Constructor";
import { empty, has } from "./../helpers";
import { FindService } from "./FindService";

export class SymbolService {

    public static active: SymbolInformation[];

    public static getSymbolsInSymbol({ name, containerName, kind }: SymbolInformation): SymbolInformation[] {
        if (kind === SymbolKind.Class) {
            containerName = containerName
                ? containerName.concat("\\", name)
                : name;
        } else {
            containerName = name;
        }

        return SymbolService.active.filter((symbol: SymbolInformation) => {
            return symbol.containerName === containerName;
        });
    }

    public async isReady() {
        SymbolService.active = await this.getAll();
        const classExist = this.classExist();

        return !(empty(SymbolService.active) && has(classExist));
    }
    /**
     * getSymbols
     */
    public getAll() {
        return commands.executeCommand<SymbolInformation[]>("vscode.executeDocumentSymbolProvider",
            ClassHelper.editor.document.uri
        );
    }

    public async update() {
        SymbolService.active = await this.getAll();
        const activeClass = new Class();
        const construct = new Constructor();
    }

    /**
     * getRegExClass
     */
    private classExist() {
        const start = new Position(0, 0);
        const end = new Position(
            ClassHelper.editor.document.lineCount - 1,
            0
        );
        const range = new Range(start, end);
        const foundClass = FindService.findAllCharacters("class", range);
        return foundClass;
    }
}
