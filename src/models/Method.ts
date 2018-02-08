import { Position, SnippetString, SymbolInformation, SymbolKind, window } from "vscode";
import { ClassHelper } from "../ClassHelper";
import { scrollIntoView, uppercaseFirst } from "../helpers";
import { FindService } from "../services/FindService";
import { SymbolService } from "../services/SymbolService";
import { Class } from "./Class";
import { METHOD_TYPE } from "./enums/GetterSetter";

export class Method {
    /**
     * All methods in an active class
     */
    public methods: SymbolInformation[];

    constructor() {
        this.methods = this.getAll();
    }

    /**
     * Add a method snippet
     */
    public add(isPrivate = false): void {
        const visibility = isPrivate ? "\tprivate" : "\tpublic";
        let text = visibility + " function ${1:functionName}($2) \n\t{\n\t\t${3://not implemented}\n\t}$0\n";

        const firstPrivateMetod = this.getFirstPrivate();
        let position;

        if (firstPrivateMetod && !isPrivate) {
            const { line } = firstPrivateMetod.location.range.start;
            position = new Position(line, 0);
            text = text + "\n";
        } else {
            const { line, character } = Class.active.location.range.end;
            text = "\n" + text;
            position = new Position(line, character - 1);
        }

        const snippet = new SnippetString(text);
        ClassHelper.editor.insertSnippet(snippet, position);
        scrollIntoView(position);
    }

    /**
     * Generate a text snippet to later add to a document
     */
    public getGetterOrSetterSnippet(property: SymbolInformation, type: METHOD_TYPE): string {
        const propName = property.name.slice(1);
        let functionName: string;
        let text: string;

        if (type === METHOD_TYPE.Getter) {
            functionName = `get${uppercaseFirst(propName)}`;
            text = `\tpublic function ${functionName}() \n\t{\n\t\treturn \$this->${propName};\n\t}\n`;
        } else {
            functionName = `set${uppercaseFirst(propName)}`;
            // tslint:disable-next-line:max-line-length
            text = `\n\tpublic function ${functionName}(${property.name}) \n\t{\n\t\t\$this->${propName} = ${property.name};\n\t}`;
        }

        const method = this.getByName(functionName);
        if (method) {
            window.setStatusBarMessage(`method ${functionName} already exist`, 3000);
            return;
        }

        return text;
    }

    /**
     * Get method by its name
     */
    public getByName(methodName: string): SymbolInformation {
        const methods = this.getAll();
        return methods.find((symbol) => {
            return symbol.name === methodName;
        });
    }

    /**
     * Get the first private method in a class
     */
    private getFirstPrivate(): SymbolInformation {

        return this.methods
            .filter((symbol) => {
                if (symbol.kind === SymbolKind.Method) {
                    const { range } = symbol.location;
                    return FindService.findRegExInRange(/\s*private\s*function/, range);
                }
            }).shift();
    }

    /**
     * Get all methods in an active class
     */
    private getAll(): SymbolInformation[] {
        const activeClass = SymbolService.getSymbolsInSymbol(Class.active);

        return activeClass
            .filter((symbol) => {
                return symbol.kind === SymbolKind.Method;
            });
    }
}
