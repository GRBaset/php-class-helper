import { Property } from "../models/Property";
import { VariableAdder } from "../models/VariableAdder";
import { Support } from "./intefaces/Support";
import { JavaScript } from "./JavaScript";

export class TypeScript extends JavaScript {
    public supports: Support;

    public constructorText = "\n\tconstructor() {\n\t}";
    public propertyText = "\n\t" + Property.visibility + " " + VariableAdder.placeholder + ";";

    constructor() {
        super();
        this.supports = new Support();
        this.supports.setVisibilty(true);
        this.supports.setProperties(true);
    }

    public getMethodText(isPrivate: boolean) {
        const visibility = isPrivate ? "\tprivate " : "\tpublic ";
        const text = visibility +
            "${1:functionName}($2): any {\n\t\t${3:throw new Error(\"Method not implemented.\");}\n\t}$0\n";
        return text;
    }
}
