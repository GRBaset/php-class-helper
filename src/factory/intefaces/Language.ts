import { SnippetString } from "vscode";

export interface Language {

    supportsProperties: boolean;
    classSnippet: SnippetString;

    constructorName: string;
    constructorText: string;

    propertyText: string;
    assignmentEqualSign: string;
    argumentText: string;
    assignmentText: string;

    // getConstructor(symbolsInClass: SymbolInformation[]);
}
