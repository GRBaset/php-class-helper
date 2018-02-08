import { Property } from "../models/Property";
import { VariableAdder } from "../models/VariableAdder";
import { Support } from "./intefaces/Support";
import { JavaScript } from "./JavaScript";

export class TypeScript extends JavaScript {
    public supports: Support;

    public propertyText = "\n\t" + Property.visibility + " " + VariableAdder.placeholder + ";";

    constructor() {
        super();
        this.supports = new Support();
        this.supports.setVisibilty(true);
        this.supports.setProperties(true);
    }
}
