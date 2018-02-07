import { Position } from "vscode";
import { Command } from "../Command";
import { scrollIntoView } from "../helpers";
import { FindService } from "../services/FindService";
import { SymbolService } from "../services/SymbolService";
import { Argument } from "./Argument";
import { Assignment } from "./Assignment";
import { Class } from "./Class";
import { Property } from "./Property";

export class VariableAdder {

    public static id = 1;
    public static placeholder = "PROPERTY" + VariableAdder.id;

    public static updateId() {
        VariableAdder.id++;
        VariableAdder.placeholder = "PROPERTY" + VariableAdder.id;
    }

    /**
     * addVariables
     */
    public async add() {
        const prop = new Property();
        const property: [Position, string] = prop.add();

        const arg = new Argument();
        const argument: [Position, string] = arg.add();

        const asn = new Assignment();
        const assigment: [Position, string] = asn.add();

        await Command.editor.edit((edit) => {
            edit.insert(property[0], property[1]);
            edit.insert(argument[0], argument[1]);
            edit.insert(assigment[0], assigment[1]);
        });

        scrollIntoView(property[0]);
    }
}
