export class NoteTag{

    private _tagValue: string = "";
    private _ngStyle: any = {};
    constructor(tag: string){
        this._tagValue = tag;
        this.count = 1;
    }

    public count: number = 0;

    public get tagValue(): string { return this._tagValue; }
    public toString(): string { return this.tagValue; }
    public get ngStyle(): any { return this._ngStyle; }
    public set ngStyle(style: any){ this._ngStyle = style; }

    private _isEnabled: boolean = true;

    public get isEnabled(): boolean { return this._isEnabled; }

    public enable(){ this._isEnabled = true; }
    public disable(){ this._isEnabled = false; }

    public onClick(){
        this._isEnabled = !this._isEnabled;
    }

}