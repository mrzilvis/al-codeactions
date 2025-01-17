import { commands, Range, TextEditorSelectionChangeEvent } from "vscode";
import { Command } from "../Entities/Command";

export class ContextSetter {
    public static onDidChangeTextEditorSelection(e: TextEditorSelectionChangeEvent) {
        let wordRange: Range | undefined = e.textEditor.document.getWordRangeAtPosition(e.selections[0].start, /(OnInsert|OnModify|OnDelete|OnRename|OnValidate)/i)
        let setFindRelated: boolean = wordRange !== undefined
        commands.executeCommand('setContext', Command.findRelated, setFindRelated);
    }
}