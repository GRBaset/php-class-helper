import { window } from "vscode";
import { JavaScript } from "./JavaScript";
import { Php } from "./Php";
import { TypeScript } from "./TypeScript";

export class LanguageFactory {
    public static get(languageId) {
        switch (languageId) {
            case "php":
                return new Php();
            case "javascript":
                return new JavaScript();
            case "typescript":
                return new TypeScript();
            default:
                window.showInformationMessage("Class helper factory couldn't generate a class constructor");
        }
    }
}
