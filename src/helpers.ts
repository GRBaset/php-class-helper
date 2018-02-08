import { Position, Range, TextEditor, TextEditorRevealType } from "vscode";
import { ClassHelper } from "./ClassHelper";

export function empty(collection: any[]) {
    return !collection.length;
}

export function has(collection: any[]) {
    return !empty(collection);
}

export function uppercaseFirst(word: string) {
    return word[0].toUpperCase() + word.slice(1);
}

export function scrollIntoView(position: Position) {
    const range = new Range(position, position);
    ClassHelper.editor.revealRange(range, TextEditorRevealType.InCenter);
}
