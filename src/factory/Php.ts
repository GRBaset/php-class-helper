import { SnippetString } from "vscode";
import { Property } from "../models/Property";
import { VariableAdder } from "../models/VariableAdder";
import { Language } from "./intefaces/Language";
import { Support } from "./intefaces/Support";

export class Php implements Language {
    public supports: Support;

    public classSnippet = new SnippetString("class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0");

    public constructorName = "__construct";
    public constructorText = "\n\tpublic function __construct()\n\t{\n\t}";

    public propertyText = "\n\t" + Property.visibility + " $" + VariableAdder.placeholder + ";";
    public argumentText = "$" + VariableAdder.placeholder;
    public assignmentEqualSign = " = $";
    public assignmentText = "\t$this->" + VariableAdder.placeholder +
        this.assignmentEqualSign +
        VariableAdder.placeholder + ";\n\t";

    constructor() {
        this.supports = new Support();
        this.supports.setVisibilty(true);
        this.supports.setProperties(true);
    }

    public getMethodText(isPrivate) {
        const visibility = isPrivate ? "\tprivate" : "\tpublic";
        const text = visibility + " function ${1:functionName}($2) \n\t{\n\t\t${3://not implemented}\n\t}$0\n";
        return text;
    }
}
