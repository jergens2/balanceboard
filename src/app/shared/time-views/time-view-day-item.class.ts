export class TimeViewDayItem{

    private _dateYYYYMMDD: string;
    private _displayValue: string;
    private _count: number = 0;
    private _color: string;
    private _durationMs: number = 0;
    private _ngClass: string[] = [];
    private _ngStyle: any = {};
    private _viewMode: 'ACTIVITY' | 'NOTEBOOK';
    private _isVisible: boolean = true;


    constructor(dateYYYYMMDD: string, count: number, durationMs: number, viewMode: 'ACTIVITY' | 'NOTEBOOK'){
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._count = count;
        this._durationMs = durationMs;
        this._viewMode = viewMode;
        this._displayValue = this._count.toFixed(0);
    }

    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get displayValue(): string { return this._displayValue; }
    public get color(): string { return this._color; }
    public get durationMs(): number { return this._durationMs; }
    public get viewMode(): 'ACTIVITY' | 'NOTEBOOK' { return this._viewMode; }
    public get count(): number { return this._count; }
    public get isVisible(): boolean { return this._isVisible; }

    public set color(color: string){ this._color = color;}


    public setInvisibleMonthDay(){
        this._isVisible = false;
    }

}