import { Position, Selection } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { FindService } from "../services/FindService";
import { Class } from "./Class";
import { VariableAdder } from "./VariableAdder";

export class SelectionRange {
    /**
     * all the selections in a document
     */
    public static selections: Selection[];

    public static clear() {
        SelectionRange.selections = [];
    }

    /**
     * Get all the selections
     */
    public static getSelections() {
        const classRange = Class.active.location.range;

        const selectionPositions = FindService.findAllCharacters(VariableAdder.placeholder,
            classRange
        );

        /**
         * This code below is used for this part
         * When an argument is assigned we have:
         * $this->PROPERTY = $PROPERTY;
         *
         * The findAllCharacters only returs the first occurene of a given string in a line.
         * in this case only PROPERTY after $this-> is matched.
         * $this-> >>PROPERTY<<
         *
         * To select the second PROPERTY after the = sign
         * I used this code below as a workaround aruond that
         */
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

    /**
     * Select all properties;
     */
    public static multipleSelect() {
        SelectionRange.selections = SelectionRange.getSelections();
        ClassHelper.editor.selections = SelectionRange.selections;
    }
}
