export class NoteTag{

    private _tagValue: string = "";
    constructor(tag: string){
        this._tagValue = tag;
    }

    public get tagValue(): string { return this._tagValue; }
    public toString(): string { return this.tagValue; }
}