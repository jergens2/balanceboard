import * as moment from 'moment';
import { ColorConverter } from '../../../../../shared/utilities/color-converter.class';
import { ColorType } from '../../../../../shared/utilities/color-type.enum';
import { ADIChartItemData as ADIChartItemData } from './adi-chart-item-data.interface';

export class ADIChartDisplayItem {

    private _color: string;

    private _itemData: ADIChartItemData;
    private _ngStyle: any = {};
    private _mouseIsOver: boolean = false;
    private _displayTime: string = '';

    private _valueString: string = '';
    private _units: string = '';

    public get startDateYYYYMMDD(): string { return this._itemData.startDateYYYYMMDD; }

    public get ngStyle(): any { return this._ngStyle; }
    public get mouseIsOver(): boolean { return this._mouseIsOver; }
    public get displayTime(): string { return this._displayTime; }

    public get value(): string { return this._valueString; }
    public get units(): string { return this._units; }

    constructor(itemData: ADIChartItemData, color: string) {
        this._itemData = itemData;
        this._color = color;
        this._displayTime = moment(this.startDateYYYYMMDD).format('MMM DD, YYYY');
        this._setToDurationAndPerPeriod();
    }

    public setTo(modeIsDuration: boolean, itemsAreCumulative: boolean) {
        if (itemsAreCumulative === true && modeIsDuration === true) {
            this._setToDurationAndCumulative();
        } else if (itemsAreCumulative === true && modeIsDuration === false) {
            this._setToOccurrenceAndCumulative();
        } else if (itemsAreCumulative === false && modeIsDuration === true) {
            this._setToDurationAndPerPeriod();
        } else if (itemsAreCumulative === false && modeIsDuration === false) {
            this._setToOccurrenceAndPerPeriod();
        }else{
        }
    }


    private _setToDurationAndPerPeriod() {
        // console.log("Setting to duration and per period")
        const percent = this._itemData.msPercentOfLargest * 100;
        this._ngStyle['height'] = percent.toFixed(3) + '%';
        this._setColor(percent);
        this._valueString = (this._itemData.ms / (60 * 60 * 1000)).toFixed(1);
        this._units = 'hrs';
    }
    private _setToDurationAndCumulative() {
        // console.log("Setting to duration and cumulative")
        const percent = this._itemData.msCumulativePercent * 100;
        this._ngStyle['height'] = percent.toFixed(3) + '%';
        this._setColor(percent);
        this._valueString = (this._itemData.ms / (60 * 60 * 1000)).toFixed(1);
        this._units = 'hrs';
    }
    private _setToOccurrenceAndPerPeriod() {
        // console.log("Setting to occurrence and period")
        const percent = this._itemData.occurrencePercentOfLargest * 100;
        this._ngStyle['height'] = percent.toFixed(3) + '%';
        this._setColor(percent);
        this._valueString = (this._itemData.occurrenceCount).toFixed(0);
        this._units = 'occurences';
    }
    private _setToOccurrenceAndCumulative() {
        // console.log("Setting to occurrence and cumulative")
        const percent = this._itemData.occurrenceCumulativePercent * 100;
        this._ngStyle['height'] = percent.toFixed(3) + '%';
        this._setColor(percent);
        this._valueString = (this._itemData.occurrenceCount).toFixed(0);
        this._units = 'occurences';
    }


    private _setColor(alpha: number) {
        this._ngStyle['background-color'] = ColorConverter.convert(this._color, ColorType.RGBA, alpha);
    }

    public onMouseEnter() {
        this._mouseIsOver = true;
    }
    public onMouseLeave() {
        this._mouseIsOver = false;
    }

    public toString(): string {
        return this.startDateYYYYMMDD + " : " + this._itemData.msPercentOfLargest;
    }

}
