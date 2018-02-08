import { Position } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { FindService } from "../services/FindService";
import { Constructor } from "./Constructor";
import { VariableAdder } from "./VariableAdder";

export class Assignment {
    /**
     * add an assignment
     */
    public add(): [Position, string] {
        const text = ClassHelper.language.assignmentText;

        const constructorRange = Constructor.active.location.range;
        const closingBracket = FindService.findCharacter("}", constructorRange);
        const openingBracket = FindService.findCharacter("{", constructorRange, true);

        const position = closingBracket;

        return [position, text];
    }
}
