import { Position, Range, SymbolKind } from "vscode";
import { has } from "../helpers";
import { FindService } from "../services/FindService";
import { SymbolService } from "./../services/SymbolService";
import { Constructor } from "./Constructor";
import { VariableAdder } from "./VariableAdder";

export class Argument {

    /**
     * get all constructor attributes
     */
    public get() {
        const constructorRange = Constructor.active.location.range;
        const openingBracket = FindService.findCharacter("(", constructorRange, true);
        const closingBracket = FindService.findCharacter(")", constructorRange);
        const range = new Range(openingBracket, closingBracket);

        return SymbolService.getSymbolsInSymbol(Constructor.active)
            .filter((symbol) => symbol.kind === SymbolKind.Variable && symbol.location.range.intersection(range));
    }

    /**
     * Add an attribute to a constructor
     */
    public add(): [Position, string] {
        let text = "$" + VariableAdder.placeholder;

        const constructorRange = Constructor.active.location.range;
        const openingBracket = FindService.findCharacter("(", constructorRange, true);
        const closingBracket = FindService.findCharacter(")", constructorRange);
        const isMultilineConstructor = openingBracket.line !== closingBracket.line;

        const attributes = this.get();
        const lastAttribute = [...attributes].pop();

        let position = closingBracket;

        if (isMultilineConstructor) {
            // constructor is multiline
            if (has(attributes)) {
                // find the last argument that doesn't end with a comma
                position = FindService.findRegExInRange(
                    /\s*\$\w*[^,]\s*$/g,
                    new Range(openingBracket, closingBracket)
                );

                if (position.line === closingBracket.line || position.line === openingBracket.line) {
                    // if the found argument that doesn't end with a comma
                    // is on the same line as the openig and closing bracket
                    // than use the position of the last argument
                    // and append on that a comma a the argument
                    position = lastAttribute.location.range.end;
                    text = ",\n\t\t" + text + "\n\t";
                } else {
                    // else use the position of the found argument
                    // and append a comma
                    text = ",\n\t\t" + text;
                }
            } else {
                // constructor is multiline
                // and doesn't have arguments
                text = "\t" + text + "\n\t";
            }

        } else {
            // constructor is singleline
            if (has(attributes)) {
                // add a comma if the constructor has attrbutes
                text = ", " + text;
            }
        }

        return [position, text];
    }
}
