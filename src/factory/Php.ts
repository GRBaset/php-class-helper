import { SnippetString } from "vscode";
import { Property } from "../models/Property";
import { VariableAdder } from "../models/VariableAdder";
import { Language } from "./intefaces/Language";

export class Php implements Language {
    public supportsProperties = true;

    public classSnippet = new SnippetString("class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0");

    public constructorName = "__construct";
    public constructorText = "\n\tpublic function __construct()\n\t{\n\t}";

    public propertyText = "\n\t" + Property.visibility + " $" + VariableAdder.placeholder + ";";
    public argumentText = "$" + VariableAdder.placeholder;
    public assignmentEqualSign = " = $";
    public assignmentText = "\t$this->" + VariableAdder.placeholder +
        this.assignmentEqualSign +
        VariableAdder.placeholder + ";\n\t";
}
