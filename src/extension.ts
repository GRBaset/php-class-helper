"use strict";
import { commands, window } from "vscode";
import { Command } from "./Command";
import { SymbolService } from "./services/SymbolService";

export function activate(context) {

    // tslint:disable-next-line:no-console
    console.log('Congratulations, your extension "php-class-helper" is now active!');

    const command = new Command();

    const disposable = commands.registerTextEditorCommand("php-class-helper.run", (editor) => {
        const cursor = editor.selection.active;
        command.executeAddConstructor(editor, cursor);
    });

    // const disposable2 = commands.registerTextEditorCommand("php-class-helper.addMehtod", (editor) => {
    //     const cursor = editor.selection.active;
    //     command.addMethodCommand(editor, cursor);
    // });

    // const disposable3 = commands.registerTextEditorCommand("php-class-helper.addPrivateMehtod", (editor) => {
    //     const cursor = editor.selection.active;
    //     command.addMethodCommand(editor, cursor, true);
    // });

    context.subscriptions.push(command);
    context.subscriptions.push(disposable);
    // context.subscriptions.push(disposable2);
    // context.subscriptions.push(disposable3);
}

// tslint:disable-next-line:no-empty
export function deactivate() { }
