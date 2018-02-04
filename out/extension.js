"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const Helper_1 = require("./Helper");
'use strict';
function activate(context) {
    console.log('Congratulations, your extension "php-class-helper" is now active!');
    let helper = new Helper_1.Helper();
    let disposable = vscode_1.commands.registerTextEditorCommand('php-class-helper.run', (editor) => {
        let cursor = editor.selection.active;
        helper.run(editor, cursor);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map