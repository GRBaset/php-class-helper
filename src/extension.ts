import { commands, window } from "vscode";
import { Helper } from './Helper';

'use strict';

export function activate(context) {

    console.log('Congratulations, your extension "php-class-helper" is now active!');
    let helper = new Helper();

    let disposable = commands.registerTextEditorCommand('php-class-helper.run', (editor) => {
        let cursor = editor.selection.active;
        helper.run(editor, cursor);
    });

    let disposable2 = commands.registerTextEditorCommand('php-class-helper.addMehtod', (editor) => {
        let cursor = editor.selection.active;
        helper.addMethodCommand(editor, cursor);
    });

    let disposable3 = commands.registerTextEditorCommand('php-class-helper.addPrivateMehtod', (editor) => {
        let cursor = editor.selection.active;
        helper.addMethodCommand(editor, cursor, true);
    });

    context.subscriptions.push(helper);
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
}

export function deactivate() {
}