"use strict";
import { commands, window } from "vscode";
import { ClassHelper } from "./ClassHelper";

export function activate(context) {

    // tslint:disable-next-line:no-console
    console.log('Congratulations, your extension "php-class-helper" is now active!');

    const classHelper = new ClassHelper();

    const disposable = commands.registerTextEditorCommand("class-helper.addConstructor", (editor) => {
        const cursor = editor.selection.active;
        classHelper.executeAddConstructor(editor, cursor);
    });

    const disposable2 = commands.registerTextEditorCommand("class-helper.addMehtod", (editor) => {
        const cursor = editor.selection.active;
        classHelper.executeAddMethod(editor, cursor);
    });

    const disposable3 = commands.registerTextEditorCommand("class-helper.addPrivateMehtod", (editor) => {
        const cursor = editor.selection.active;
        classHelper.executeAddMethod(editor, cursor, true);
    });

    context.subscriptions.push(classHelper);
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
}

// tslint:disable-next-line:no-empty
export function deactivate() { }
