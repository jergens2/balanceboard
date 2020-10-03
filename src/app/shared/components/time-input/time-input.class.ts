import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export class TimeInput {

    private _timeValue$: Subject<moment.Moment>;
    private _timeValue: moment.Moment;
    private _minValue: moment.Moment;
    private _maxValue: moment.Moment;

    public showButtons: boolean;
    public showDate: boolean;
    public incrementMinutes: number;
    public hideBorders: boolean;
    public color: string;
    public isBold: boolean;

    public get maxValue(): moment.Moment { return this._maxValue; }
    public get minValue(): moment.Moment { return this._minValue; }
    public set maxValue(val: moment.Moment) {
        this._maxValue = moment(val);
        if (this.timeValue.isAfter(val)) {
            this._timeValue = moment(val);
            this._timeValue$.next(val);
        }
    }
    public set minValue(val: moment.Moment) {
        this._minValue = moment(val);
        if (this.timeValue.isBefore(val)) {
            this._timeValue = moment(val);
            this._timeValue$.next(val);
        }
    }

    public get timeValue(): moment.Moment { return this._timeValue; }
    public get timeValue$(): Observable<moment.Moment> { return this._timeValue$.asObservable(); }

    constructor(timeValue: moment.Moment, maxValue?: moment.Moment, minValue?: moment.Moment) {
        if (maxValue) {
            this._maxValue = moment(maxValue);
        } else {
            this._maxValue = moment(timeValue).add(12, 'hours');
        }
        if (minValue) {
            this._minValue = moment(minValue);
        } else {
            this._minValue = moment(timeValue).subtract(12, 'hours');
        }
        this._timeValue = moment(timeValue);
        this._timeValue$ = new Subject();
        this.configure();
    }
    public configure(showButtons = true, hideBorders = true, showDate = true, incrementMinutes = 15, color = 'black', isBold = false) {
        this.showButtons = showButtons;
        this.showDate = showDate;
        this.hideBorders = hideBorders;
        this.incrementMinutes = incrementMinutes;
        this.color = color;
        this.isBold = isBold;
    }

    public changeTime(time: moment.Moment) {
        this._timeValue = moment(time);
        this._timeValue$.next(time);
    }

}
