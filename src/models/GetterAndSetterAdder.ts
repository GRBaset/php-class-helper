import { Position, SymbolInformation, window } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { Constructor } from "./Constructor";
import { METHOD_TYPE } from "./enums/GetterSetter";
import { Method } from "./Method";
import { Property } from "./Property";

export class GetterAndSetterAdder {
    public static async add(property: SymbolInformation) {

        const method = new Method();
        let getter: string = method.getGetterOrSetterSnippet(property, METHOD_TYPE.Getter);
        let setter: string = method.getGetterOrSetterSnippet(property, METHOD_TYPE.Setter);

        let position: Position;

        const construct = new Constructor();
        const cons = construct.get();

        const prop = new Property();
        const lastProperty = prop.getlast();

        if (getter) {
            getter = "\n\n" + getter;
        } else if (setter) {
            setter = "\n" + setter;
        }

        if (Constructor.active) {
            position = Constructor.active.location.range.end;
        } else {
            position = new Position(
                lastProperty.line,
                lastProperty.character + 1
            );
        }

        await ClassHelper.editor.edit((edit) => {
            if (getter) {
                edit.insert(position, getter);
                window.setStatusBarMessage(`adding getter`, 3000);
            }
            if (setter) {
                edit.insert(position, setter);
                window.setStatusBarMessage(`adding setter`, 3000);
            }
            if (getter && setter) {
                window.setStatusBarMessage(`adding getter and setter`, 3000);
            }

        });
    }
}
