import { Position } from "vscode";
import { FindService } from "../services/FindService";
import { Constructor } from "./Constructor";
import { VariableAdder } from "./VariableAdder";

export class Assignment {

    public add(): [Position, string] {
        const text = "\t$this->" + VariableAdder.placeholder + " = $" + VariableAdder.placeholder + ";\n\t";

        const constructorRange = Constructor.active.location.range;
        const closingBracket = FindService.findCharacter("}", constructorRange);
        const openingBracket = FindService.findCharacter("{", constructorRange, true);

        const position = closingBracket;

        return [position, text];
    }
}
