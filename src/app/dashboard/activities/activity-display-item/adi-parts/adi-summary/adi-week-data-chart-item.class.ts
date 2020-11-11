import * as moment from 'moment';
import { ColorConverter } from '../../../../../shared/utilities/color-converter.class';
import { ColorType } from '../../../../../shared/utilities/color-type.enum';

export class ADIWeekDataChartItem {

    private _color: string
    private _startDateYYYYMMDD: string;
    private _hours: number;
    // private _percent: number;
    private _cumulativePercent: number;
    private _percentOfLargest: number;
    private _ngStyle: any = {};
    private _mouseIsOver: boolean = false;
    private _displayTime: string = '';

    public get startDateYYYYMMDD(): string { return this._startDateYYYYMMDD; }
    public get hours(): number { return this._hours; }
    // public get percent(): number { return this._percent; }
    public get cumulativePercent(): number { return this._cumulativePercent; }
    public get percentOfLargest(): number { return this._percentOfLargest; }
    public get ngStyle(): any { return this._ngStyle; }
    public get mouseIsOver(): boolean { return this._mouseIsOver; }
    public get displayTime(): string { return this._displayTime; }

    constructor(data: {startDateYYYYMMDD: string, ms: number, cumulativePercent: number, percentOfLargest: number}) {
        this._startDateYYYYMMDD = data.startDateYYYYMMDD;
        this._hours = data.ms / (60 * 60 * 1000);
        // this._percent = percent;
        this._cumulativePercent = data.cumulativePercent * 100;
        this._percentOfLargest = data.percentOfLargest * 100;
        this._displayTime = moment(this._startDateYYYYMMDD).format('MMM DD, YYYY');
    }

    public setColor(color: string, alpha: number) {
        this._color = color;
        this._ngStyle = {
            'height': this._cumulativePercent.toFixed(3) + '%',
            'background-color': ColorConverter.convert(this._color, ColorType.RGBA, alpha),
        };
        if (!this._modeIsCumulative) {
            this._ngStyle['height'] = this._percentOfLargest.toFixed(3) + '%';
        }
    }
    private _modeIsCumulative: boolean = false;

    public setToCumulative(){
        this._modeIsCumulative = true;
        this._ngStyle['height'] = this._cumulativePercent.toFixed(3) + '%';
    }
    public setToWeekly(){
        this._modeIsCumulative = false;
        this._ngStyle['height'] = this._percentOfLargest.toFixed(3) + '%';
    }




    public onMouseEnter() {
        this._mouseIsOver = true;
    }
    public onMouseLeave() {
        this._mouseIsOver = false;
    }

}
