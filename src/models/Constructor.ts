import { Position, SymbolInformation, SymbolKind } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { empty, scrollIntoView } from "../helpers";
import { FindService } from "./../services/FindService";
import { SymbolService } from "./../services/SymbolService";
import { Class } from "./Class";
import { Property } from "./Property";

export class Constructor {
    /**
     * Active constructor of a class
     */
    public static active: SymbolInformation;

    constructor() {
        this.get();
    }
    /**
     * Get constructor of an active class
     */
    public get(): SymbolInformation {
        Constructor.active = SymbolService.getSymbolsInSymbol(Class.active).find((classSymbol) => {
            return classSymbol.name === ClassHelper.language.constructorName;
        });

        return Constructor.active;
    }

    /**
     * Add a consturctor
     */
    public add(): void {
        let text = ClassHelper.language.constructorText;
        const property = new Property();
        const properties = property.getAll();

        let position;

        if (empty(properties)) {
            // add constructor at the begging of a class
            const classRange = Class.active.location.range;
            const openBracket: Position = FindService.findCharacter("{", classRange, true);
            position = openBracket;
        } else {
            // add constructor after last property;
            text = "\n" + text;
            const lastProperty: Position = properties.pop().location.range.end;
            position = new Position(
                lastProperty.line,
                lastProperty.character + 1
            );
        }

        ClassHelper.editor.edit((edit) => {
            edit.insert(position, text);
        });

        scrollIntoView(position);
    }
}
