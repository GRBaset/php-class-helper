// tslint:disable-next-line:max-line-length
import { commands, Position, Range, Selection, SnippetString, SymbolInformation, SymbolKind, TextEditor, TextEditorRevealType, window, workspace } from "vscode";

import { empty, has, uppercaseFirst } from "./helpers";
import { Class } from "./models/Class";
import { Constructor } from "./models/Constructor";
import { SelectionRange } from "./models/SelectionRange";
import { VariableAdder } from "./models/VariableAdder";
import { FindService } from "./services/FindService";
import { SymbolService } from "./services/SymbolService";

export class Command {
    public static editor: TextEditor;
    public static cursor: Position;

    // public async addMethodCommand(editor, cursor, isPrivate = false) {
    //     Command.editor = editor;
    //     Command.cursor = cursor;

    //     const findService = new FindService(editor.document);
    //     const symbolService = new SymbolService(editor.document, findService);

    //     const ready = await this.symbolService.ready();

    //     if (!ready) {
    //         window.showInformationMessage("PHP Class Helper - Pleas wait a couple of seconds");
    //         return;
    //     }

    //     const activeClass = new Class(this.symbolService, );

    //     this.activeClass = activeClass.getByCursor(cursor);
    //     if (!this.activeClass) {
    //         activeClass.add(editor, cursor);
    //         return;
    //     }

    //     const property: SymbolInformation = this.getPropertyUnderCursor();

    //     if (property) {
    //         await this.addGetterAndSetter(property);
    //         return;
    //     }

    //     this.addMethod(isPrivate);
    // }

    public async executeAddConstructor(editor: TextEditor, cursor: Position) {
        Command.editor = editor;
        Command.cursor = cursor;

        SelectionRange.clear();

        FindService.document = editor.document;
        const symbolService = new SymbolService();

        const ready = await symbolService.ready();

        if (!ready) {
            window.showInformationMessage("PHP Class Helper - Pleas wait a couple of seconds");
            return;
        }

        const activeClass = new Class();
        if (!Class.active) {
            activeClass.add();
            return;
        }

        const construct = new Constructor();
        if (!Constructor.active) {
            construct.add();
            return;
        }

        const variableAdder = new VariableAdder();
        await variableAdder.add();
        await symbolService.update();

        SelectionRange.multipleSelect();
        VariableAdder.updateId();
    }

    // private async addGetterAndSetter(property: SymbolInformation) {
    //     let getter: string | null = this.addGetter(property);
    //     let setter: string | null = this.addSetter(property);

    //     let position: Position;

    //     this.construct = this.getConstructor();
    //     const lastProperty = this.getProperties().pop().location.range.end;

    //     if (getter) {
    //         getter = "\n\n" + getter;
    //     } else if (setter) {
    //         setter = "\n" + setter;
    //     }

    //     if (this.construct) {
    //         position = this.construct.location.range.end;
    //     } else {
    //         position = new Position(
    //             lastProperty.line,
    //             lastProperty.character + 1
    //         );
    //     }

    //     await this.editor.edit((edit) => {
    //         if (getter) {
    //             edit.insert(position, getter);
    //             window.setStatusBarMessage(`adding getter`, 3000);
    //         }
    //         if (setter) {
    //             edit.insert(position, setter);
    //             window.setStatusBarMessage(`adding setter`, 3000);
    //         }
    //         if (getter && setter) {
    //             window.setStatusBarMessage(`adding getter and setter`, 3000);
    //         }

    //     });
    // }

    // private addGetter(property: SymbolInformation, isPrivate = false) {
    //     const propName = property.name.slice(1);
    //     const functionName = `get${uppercaseFirst(propName)}`;

    //     const method = this.getMethod(functionName);
    //     if (method) {
    //         window.setStatusBarMessage(`method ${functionName} already exist`, 3000);
    //         return;
    //     }

    //     return `\tpublic function ${functionName}() \n\t{\n\t\treturn \$this->${propName};\n\t}\n`;
    // }

    // private addSetter(property: SymbolInformation, isPrivate = false) {
    //     const propName = property.name.slice(1);

    //     const functionName = `set${uppercaseFirst(propName)}`;

    //     const method = this.getMethod(functionName);
    //     if (method) {
    //         window.setStatusBarMessage(`method ${functionName} already exist`, 3000);
    //         return;
    //     }

    //     const text = `\n\tpublic function ${functionName}(${property.name})
    //         \n\t{\n\t\t\$this->${propName} = ${property.name};\n\t}`;

    //     return text;
    // }

    // private addMethod(isPrivate = false) {
    //     const visibility = isPrivate ? "\tprivate" : "\tpublic";
    //     let text = visibility + " function ${1:functionName}($2) \n\t{\n\t\t${3://not implemented}\n\t}$0\n";

    //     const firstPrivateMetod = this.getFirstPrivateMethod();
    //     let position;

    //     if (firstPrivateMetod && !isPrivate) {
    //         const { line } = firstPrivateMetod.location.range.start;
    //         position = new Position(line, 0);
    //         text = text + "\n";
    //     } else {
    //         const { line, character } = this.activeClass.location.range.end;
    //         text = "\n" + text;
    //         position = new Position(line, character - 1);
    //     }

    //     const snippet = new SnippetString(text);
    //     this.editor.insertSnippet(snippet, position);
    //     this.scrollIntoView(position);
    // }

    // private getMethods() {
    //     const activeClassMethods = this.symbolService.getSymbolsInSymbol(this.activeClass);

    //     return activeClassMethods
    //         .filter((symbol) => {
    //             return symbol.kind === SymbolKind.Method;
    //         });
    // }

    // private getMethod(propName) {
    //     const methods = this.getMethods();
    //     return methods.find((symbol) => {
    //         return symbol.name === propName;
    //     });
    // }

    // private getFirstPrivateMethod(): SymbolInformation {
    //     return this.symbols
    //         .filter((symbol) => {
    //             if (symbol.kind === SymbolKind.Method) {
    //                 const { range } = symbol.location;
    //                 return this.findRegExInRange(/\s*private\s*function/, range);
    //             }
    //         }).shift();
    // }
}
