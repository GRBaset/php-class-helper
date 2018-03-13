import { Position } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { scrollIntoView } from "../helpers";
import { Argument } from "./Argument";
import { Assignment } from "./Assignment";
import { Class } from "./Class";
import { Property } from "./Property";

export class VariableAdder {
    /**
     * Properties have IDs, which are used by the multipleSelect method
     */
    public static id = 1;
    public static placeholder = "PROPERTY" + VariableAdder.id;

    public static updateId() {
        VariableAdder.id++;
        VariableAdder.placeholder = "PROPERTY" + VariableAdder.id;
    }

    /**
     * Add properties, arguments, assigments to a class
     */
    public async add(isPrivate) {
        let prop: Property;
        let property: [Position, string];

        if (ClassHelper.language.supports.properties) {
            prop = new Property();
            property = prop.add(isPrivate);
        }

        const arg = new Argument();
        const argument: [Position, string] = arg.add();

        const asn = new Assignment();
        const assigment: [Position, string] = asn.add();

        await ClassHelper.editor.edit((edit) => {
            if (ClassHelper.language.supports.properties) {
                edit.insert(property[0], property[1]);
            }
            edit.insert(argument[0], argument[1]);
            edit.insert(assigment[0], assigment[1]);
        });

        scrollIntoView(assigment[0]);
    }
}
