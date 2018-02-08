import { Position, SymbolInformation, SymbolKind } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { empty, scrollIntoView } from "../helpers";
import { FindService } from "./../services/FindService";
import { SymbolService } from "./../services/SymbolService";
import { Class } from "./Class";
import { Property } from "./Property";

export class Constructor {
    /**
     * active constructor
     */
    public static active: SymbolInformation;

    constructor() {
        this.get();
    }
    /**
     * getConstructor
     */
    public get(): SymbolInformation {
        Constructor.active = SymbolService.getSymbolsInSymbol(Class.active).find((classSymbol) => {
            return classSymbol.kind === SymbolKind.Constructor;
        });

        return Constructor.active;
    }

    public add(): void {
        let text = "\n\tpublic function __construct()\n\t{\n\t}";
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
