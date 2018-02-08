import { Position, SymbolInformation, TextDocument, TextEditor, window } from "vscode";
import { Language } from "./factory/intefaces/Language";
import { LanguageFactory } from "./factory/LanguageFactory";
import { Class } from "./models/Class";
import { Constructor } from "./models/Constructor";
import { GetterAndSetterAdder } from "./models/GetterAndSetterAdder";
import { Method } from "./models/Method";
import { Property } from "./models/Property";
import { SelectionRange } from "./models/SelectionRange";
import { VariableAdder } from "./models/VariableAdder";
import { FindService } from "./services/FindService";
import { SymbolService } from "./services/SymbolService";

export class ClassHelper {
    public static editor: TextEditor;
    public static cursor: Position;
    public static document: TextDocument;
    public static language: Language;

    public async executeAddMethod(editor, cursor, isPrivate = false) {
        ClassHelper.editor = editor;
        ClassHelper.cursor = cursor;
        ClassHelper.document = editor.document;

        ClassHelper.language = LanguageFactory.get(editor.document.languageId);

        const symbolService = new SymbolService();
        const ready = await symbolService.isReady();
        if (!ready) {
            window.showInformationMessage("PHP Class Helper - Pleas wait a couple of seconds");
            return;
        }

        const activeClass = new Class();
        if (!Class.active) {
            activeClass.add();
            return;
        }

        const properties = new Property();
        const property: SymbolInformation = properties.getByCursorPosition();

        if (property && ClassHelper.language.supports.properties) {
            await GetterAndSetterAdder.add(property);
            return;
        }

        const method = new Method();
        method.add(isPrivate);
    }

    public async executeAddConstructor(editor: TextEditor, cursor: Position) {
        ClassHelper.editor = editor;
        ClassHelper.cursor = cursor;
        ClassHelper.document = editor.document;

        ClassHelper.language = LanguageFactory.get(editor.document.languageId);

        SelectionRange.clear();

        const symbolService = new SymbolService();
        const ready = await symbolService.isReady();
        if (!ready) {
            window.showInformationMessage("PHP Class Helper - Pleas wait a couple of seconds");
            return;
        }

        // console.log(SymbolService.active);

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
}
