import { Position, Selection } from "vscode";
import { Command } from "../Command";
import { FindService } from "../services/FindService";
import { Class } from "./Class";
import { VariableAdder } from "./VariableAdder";

export class SelectionRange {

    public static selections: Selection[];

    public static clear() {
        SelectionRange.selections = [];
    }

    public static getSelections() {
        const classRange = Class.active.location.range;

        const selectionPositions = FindService.findAllCharacters(VariableAdder.placeholder,
            classRange
        );

        const lastSelection: Position = [...selectionPositions].pop();
        const propertySelection = new Position(
            lastSelection.line,
            lastSelection.character + VariableAdder.placeholder.length + 4
        );

        selectionPositions.push(propertySelection);

        return selectionPositions.map((selection) => {
            return new Selection(
                new Position(selection.line, selection.character),
                new Position(selection.line, selection.character + VariableAdder.placeholder.length)
            );
        });
    }

    public static selectProperties() {
        SelectionRange.selections = SelectionRange.getSelections();
        Command.editor.selections = SelectionRange.selections;
    }
}
