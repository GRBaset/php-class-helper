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

    context.subscriptions.push(disposable);
}

export function deactivate() {
}