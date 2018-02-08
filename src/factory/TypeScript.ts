import { Property } from "../models/Property";
import { VariableAdder } from "../models/VariableAdder";
import { JavaScript } from "./JavaScript";

export class TypeScript extends JavaScript {
    public supportsProperties = true;
    public propertyText = "\n\t" + Property.visibility + " " + VariableAdder.placeholder + ";";
}
