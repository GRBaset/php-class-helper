import { workspace } from "vscode";
import { Property } from "../models/Property";
import { VariableAdder } from "../models/VariableAdder";
import { Support } from "./intefaces/Support";
import { JavaScript } from "./JavaScript";

export class TypeScript extends JavaScript {
    public supports: Support;

    public constructorText = "\n\tconstructor() {\n\t}";

    private config = {
        prefixType: true,
        prefixVisibility: true,
        visibility: "thisShouldNotShow"
    };

    constructor() {
        super();
        this.supports = new Support();
        this.supports.setVisibilty(true);
        this.supports.setProperties(true);
    }

    public getPropertyText() {
        this.loadTypeScriptSetting();
        const text = "\n\t" +
            (this.config.prefixVisibility ? this.config.visibility + " " : "") +
            VariableAdder.placeholder
            + ";";
        return text;
    }

    public getMethodText(isPrivate: boolean) {
        this.loadTypeScriptSetting();
        const visibility = isPrivate ? "private " : "public ";
        const type = ": ${3:any} ";
        const text = "\t" +
            (this.config.prefixVisibility ? visibility : "") +
            "${1:functionName}($2)" +
            (this.config.prefixType ? type : "") +
            "{\n\t\t${4:throw new Error(\"Method not implemented.\");}\n\t}$0\n";
        return text;
    }

    public getGetterText(functionName: string, propertyName: string): string {
        this.loadTypeScriptSetting();
        const visibility = "public ";
        const text = "\t" +
            (this.config.prefixVisibility ? visibility : "") +
            `${functionName}() {\n\t\treturn this.${propertyName};\n\t}\n`;

        return text;
    }

    public getSetterText(functionName: string, propertyName: string): string {
        this.loadTypeScriptSetting();
        // tslint:disable-next-line:max-line-length
        const visibility = "public ";
        const text = "\n\t" +
            (this.config.prefixVisibility ? visibility : "") +
            `${functionName}(${propertyName}) {\n\t\tthis.${propertyName} = ${propertyName};\n\t}`;
        return text;
    }

    private loadTypeScriptSetting() {
        const config = workspace.getConfiguration("php-class-helper");
        this.config.prefixVisibility = config.get("ts.prefixVisibility");
        this.config.visibility = config.get("ts.property.visibility");
        this.config.prefixType = config.get("ts.method.prefixType");
    }
}
