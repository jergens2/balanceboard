import * as moment from 'moment';

export class DaybookSleepEntryItem{
    
    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    
    constructor(startTime: moment.Moment, endTime: moment.Moment){
        this._startTime = startTime;
        this._endTime = endTime;
    }

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }

    

}