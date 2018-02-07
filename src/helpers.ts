import { Position, Range, TextEditor, TextEditorRevealType } from "vscode";

export function empty(collection: any[]) {
    return !collection.length;
}

export function has(collection: any[]) {
    return !empty(collection);
}

export function uppercaseFirst(word: string) {
    return word[0].toUpperCase() + word.slice(1);
}

export function scrollIntoView(editor: TextEditor, position: Position) {
    const range = new Range(position, position);
    editor.revealRange(range, TextEditorRevealType.InCenter);
}
