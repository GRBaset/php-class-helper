import { SnippetString } from "vscode";
import { VariableAdder } from "../models/VariableAdder";
import { Language } from "./intefaces/Language";

export class JavaScript implements Language {
    public supportsProperties = false;

    public classSnippet = new SnippetString("class ${1:$TM_FILENAME_BASE}$2 {\n\t$3\n}$0");

    public constructorName = "constructor";
    public constructorText = "\n\tconstructor() {\n\t}";

    public propertyText = "";
    public argumentText = VariableAdder.placeholder;
    public assignmentEqualSign = " = ";
    public assignmentText = "\tthis." + VariableAdder.placeholder +
        this.assignmentEqualSign +
        VariableAdder.placeholder + ";\n\t";

}
