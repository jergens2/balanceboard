export class TimeViewItem{

    private _dateYYYYMMDD: string;
    private _displayValue: string;
    private _color: string;
    private _durationMs: number = 0;
    private _ngClass: string[] = [];
    private _ngStyle: any = {};

    constructor(dateYYYYMMDD: string, displayValue: string, color: string, durationMs: number){
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._displayValue = displayValue;
        this._color = color;
        this._durationMs = durationMs;
    }

    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get displayValue(): string { return this._displayValue; }
    public get color(): string { return this._color; }
    public get durationMs(): number { return this._durationMs; }
}