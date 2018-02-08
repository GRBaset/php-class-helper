import { Position, SymbolInformation, SymbolKind, workspace } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { empty } from "../helpers";
import { FindService } from "../services/FindService";
import { SymbolService } from "./../services/SymbolService";
import { Class } from "./Class";
import { VariableAdder } from "./VariableAdder";

export class Property {
    private visibility: string;

    constructor() {
        this.loadSettings();
    }

    /**
     * getProperties
     */
    public getAll(): SymbolInformation[] {
        return SymbolService.getSymbolsInSymbol(Class.active)
            .filter((symbol) => symbol.kind === SymbolKind.Property);
    }
    /**
     * addProperty
     */
    public add(): [Position, string] {
        const staticText = "\n\t" + this.visibility + " $";
        let text = staticText + VariableAdder.placeholder + ";";
        const properties = this.getAll();

        let position;

        if (empty(properties)) {
            // add property at the begging of a class
            const classRange = Class.active.location.range;
            const openBracket = FindService.findCharacter("{", classRange, true);

            text += "\n";
            position = openBracket;
        } else {
            // add property after last property;
            const lastProperty: Position = properties.pop().location.range.end;
            position = new Position(
                lastProperty.line,
                lastProperty.character + 1
            );
        }

        return [position, text];
    }
    /**
     * getPropertyUnderCursor
     */
    public getByCursorPosition(): SymbolInformation {
        return this.getAll().find((property) => {
            const { start, end } = property.location.range;

            return start.isBeforeOrEqual(ClassHelper.cursor) && end.isAfterOrEqual(ClassHelper.cursor);
        });
    }

    public getlast() {
        return this.getAll().pop().location.range.end;
    }

    private loadSettings() {
        const config = workspace.getConfiguration("php-class-helper");
        this.visibility = config.get("visibility", "private");
    }
}
