import { Position, SymbolInformation, SymbolKind, workspace } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { empty } from "../helpers";
import { FindService } from "../services/FindService";
import { SymbolService } from "./../services/SymbolService";
import { Class } from "./Class";
import { Constructor } from "./Constructor";
import { VariableAdder } from "./VariableAdder";

export class Property {

    /**
     * Get all propertise of the active class
     */
    public getAll(): SymbolInformation[] {
        return SymbolService.getSymbolsInSymbol(Class.active)
            .filter((symbol) => {
                if (Constructor.active) {
                    return (symbol.kind === SymbolKind.Property
                        // dont include typescript constructor property definition
                        && !symbol.location.range.intersection(Constructor.active.location.range)
                    );
                }
                return symbol.kind === SymbolKind.Property;
            });
    }
    /**
     * Add a property
     */
    public add(isPrivate): [Position, string] {
        let text = ClassHelper.language.getPropertyText(isPrivate);
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
     * Get property under cursor
     */
    public getByCursorPosition(): SymbolInformation {
        return this.getAll().find((property) => {
            const { start, end } = property.location.range;

            return start.isBeforeOrEqual(ClassHelper.cursor) && end.isAfterOrEqual(ClassHelper.cursor);
        });
    }

    /**
     * Get Last property
     */
    public getlast() {
        return this.getAll().pop().location.range.end;
    }
}
