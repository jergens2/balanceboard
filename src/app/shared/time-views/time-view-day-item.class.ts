import * as moment from 'moment';

export class TimeViewDayItem {

    private _dateYYYYMMDD: string;
    private _displayValue: string;
    private _count: number = 0;
    private _color: string;
    private _durationMs: number = 0;
    private _ngClass: string[] = [];
    private _ngStyle: any = {};
    private _viewMode: 'ACTIVITY' | 'NOTEBOOK';
    private _isVisible: boolean = true;
    private _displayDate: string = "";
    private _showPopup: boolean = false;
    private _popupVals: string[] = [];


    constructor(dateYYYYMMDD: string, count: number, durationMs: number, viewMode: 'ACTIVITY' | 'NOTEBOOK') {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._count = count;
        this._durationMs = durationMs;
        this._viewMode = viewMode;
        this._displayValue = this._count.toFixed(0);
        this._displayDate = moment(this.dateYYYYMMDD).format('MMM Do, YYYY');
    }

    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get displayValue(): string { return this._displayValue; }
    public get displayDate(): string { return this._displayDate; }
    public get color(): string { return this._color; }

    public get durationMs(): number { return this._durationMs; }
    public get viewMode(): 'ACTIVITY' | 'NOTEBOOK' { return this._viewMode; }
    public get count(): number { return this._count; }
    public get isVisible(): boolean { return this._isVisible; }
    public get showPopup(): boolean { return this._showPopup; }
    public get hasPopupVal(): boolean { return this._popupVals.length > 0; }
    public get popupVals(): string[] { return this._popupVals; }

    public set color(color: string) { this._color = color; }

    private _isSelected: boolean = false;
    public get isSelected(): boolean { return this._isSelected; }
    public select() { this._isSelected = true; }
    public unselect() { this._isSelected = false; }



    public setInvisibleMonthDay() {
        this._isVisible = false;
    }
    public enablePopup(){this._showPopup = true;}
    public disablePopup(){ 
        this._showPopup = false; 
        this._popupVals = [];
    }
    public enableRangePopup(vals: string[]){
        this._showPopup = true;
        this._popupVals = vals;
    }

    private _mouseIsOver: boolean = false;
    public onMouseEnter() { this._mouseIsOver = true; }
    public onMouseLeave() { this._mouseIsOver = false; }
    public get mouseIsOver(): boolean { return this._mouseIsOver; }

}