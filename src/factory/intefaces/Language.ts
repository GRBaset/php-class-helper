import { SnippetString } from "vscode";
import { Support } from "./Support";

export abstract class Language {

    public abstract supports: Support;
    public abstract classSnippet: SnippetString;

    public abstract constructorName: string;
    public abstract constructorText: string;

    public abstract assignmentEqualSign: string;
    public abstract argumentText: string;
    public abstract assignmentText: string;

    public abstract getPropertyText(isPrivate?: boolean): string;
    public abstract getMethodText(isPrivate?: boolean): string;
    public abstract getGetterText(functionName: string, propertyName: string): string;
    public abstract getSetterText(functionName: string, propertyName: string): string;
    // getConstructor(symbolsInClass: SymbolInformation[]);
}
