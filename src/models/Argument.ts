import { Position, Range, SymbolKind } from "vscode";
import { has } from "../helpers";
import { FindService } from "../services/FindService";
import { SymbolService } from "./../services/SymbolService";
import { Constructor } from "./Constructor";
import { VariableAdder } from "./VariableAdder";

export class Argument {

    /**
     * getAttributes
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
     * addAttribute
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
            if (has(attributes)) {
                position = FindService.findRegExInRange(
                    /\s*\$\w*[^,]\s*$/g,
                    new Range(openingBracket, closingBracket)
                );

                if (position.line === closingBracket.line || position.line === openingBracket.line) {
                    position = lastAttribute.location.range.end;
                    text = ",\n\t\t" + text + "\n\t";
                } else {
                    text = ",\n\t\t" + text;
                }
            } else {
                text = "\t" + text + "\n\t";
            }

        } else {
            if (has(attributes)) {
                text = ", " + text;
            }
        }

        return [position, text];
    }
}
