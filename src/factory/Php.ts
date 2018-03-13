import { SnippetString, workspace } from "vscode";
import { Property } from "../models/Property";
import { VariableAdder } from "../models/VariableAdder";
import { Language } from "./intefaces/Language";
import { Support } from "./intefaces/Support";

export class Php extends Language {
    public supports: Support;

    public classSnippet = new SnippetString("class ${1:$TM_FILENAME_BASE}$2 \n{\n\t$3\n}$0");

    public constructorName = "__construct";
    public constructorText = "\n\tpublic function __construct()\n\t{\n\t}";

    public argumentText = "$" + VariableAdder.placeholder;
    public assignmentEqualSign = " = $";
    public assignmentText = "\t$this->" + VariableAdder.placeholder +
        this.assignmentEqualSign +
        VariableAdder.placeholder + ";\n\t";

    private config = {
        visibility: "thisShouldNotShow"
    };

    constructor() {
        super();
        this.supports = new Support();
        this.supports.setVisibilty(true);
        this.supports.setProperties(true);
    }

    public getPropertyText(isPrivate = false) {
        this.loadPhpSetting();
        const text = "\n\t" +
            (isPrivate ? "private" : this.config.visibility) +
            " $" +
            VariableAdder.placeholder
            + ";";
        return text;
    }

    public getMethodText(isPrivate) {
        const visibility = isPrivate ? "\tprivate" : "\tpublic";
        const text = visibility +
            " function ${1:functionName}($2) \n\t{\n\t\t${3:throw new Exception('Method not implemented');}\n\t}$0\n";
        return text;
    }

    public getGetterText(functionName: string, propertyName: string): string {
        return `\tpublic function ${functionName}() \n\t{\n\t\treturn \$this->${propertyName};\n\t}\n`;
    }

    public getSetterText(functionName: string, propertyName: string): string {
        // tslint:disable-next-line:max-line-length
        const text = `\n\tpublic function ${functionName}(\$${propertyName}) \n\t{\n\t\t\$this->${propertyName} = \$${propertyName};\n\t}`;
        return text;
    }

    private loadPhpSetting() {
        const config = workspace.getConfiguration("class-helper");
        this.config.visibility = config.get("php.property.visibility");
    }
}
