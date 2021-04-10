import { NotebookEntryTypes } from "../../notebook-entry/notebook-entry-types.enum";
import { NotebookEntry } from "../../notebook-entry/notebook-entry.class";

export class NotesListItem extends NotebookEntry{
    constructor(note: NotebookEntry){
        super(note.id, note.userId, note.dateCreated, NotebookEntryTypes.Note, note.textContent, note.title, note.tags);
        this._textLines = this.textContent.split('\n');
    }


    private _isExpanded: boolean = false;
    private _textLines: string[] = [];
    public get textLines(): string[] { return this._textLines; }

    public get isExpanded(): boolean { return this._isExpanded; }

    public onClick(){
        this._isExpanded = !this._isExpanded; 
    }
}