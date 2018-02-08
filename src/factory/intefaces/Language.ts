import { SnippetString } from "vscode";
import { Support } from "./Support";

export interface Language {

    supports: Support;
    classSnippet: SnippetString;

    constructorName: string;
    constructorText: string;

    propertyText: string;
    assignmentEqualSign: string;
    argumentText: string;
    assignmentText: string;

    // getConstructor(symbolsInClass: SymbolInformation[]);
}
