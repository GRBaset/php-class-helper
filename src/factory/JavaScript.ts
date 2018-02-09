import { SnippetString } from "vscode";
import { VariableAdder } from "../models/VariableAdder";
import { Language } from "./intefaces/Language";
import { Support } from "./intefaces/Support";

export class JavaScript implements Language {
    public supports: Support;

    public classSnippet = new SnippetString("class ${1:$TM_FILENAME_BASE}$2 {\n\t$3\n}$0");

    public constructorName = "constructor";
    public constructorText = "\n\n\tconstructor() {\n\t}";

    public propertyText = "";
    public argumentText = VariableAdder.placeholder;
    public assignmentEqualSign = " = ";
    public assignmentText = "\tthis." + VariableAdder.placeholder +
        this.assignmentEqualSign +
        VariableAdder.placeholder + ";\n\t";

    constructor() {
        this.supports = new Support();
        this.supports.setVisibilty(false);
        this.supports.setProperties(false);
    }

    public getMethodText(isPrivate: boolean) {
        return "\t${1:functionName}($2) {\n\t\t${3:throw new Error(\"Method not implemented.\");}\n\t}$0\n";
    }

    public getGetterText(functionName: string, propertyName: string): string {
        return `\tpublic ${functionName}() {\n\t\treturn this.${propertyName};\n\t}\n`;
    }

    public getSetterText(functionName: string, propertyName: string): string {
        // tslint:disable-next-line:max-line-length
        const text = `\n\tpublic ${functionName}(${propertyName}) {\n\t\tthis.${propertyName} = ${propertyName};\n\t}`;
        return text;
    }
}
