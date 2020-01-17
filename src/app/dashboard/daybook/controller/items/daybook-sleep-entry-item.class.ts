import * as moment from 'moment';
import { TimeSpanItem } from '../../../../shared/utilities/time-utilities/time-span-item.interface';

export class DaybookSleepEntryItem{
    
    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    
    constructor(startTime: moment.Moment, endTime: moment.Moment){
        this._startTime = startTime;
        this._endTime = endTime;
    }

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }

    public get saveToDB(): TimeSpanItem{
        return {
            startTimeISO: this.startTime.toISOString(),
            startTimeUtcOffset: this.startTime.utcOffset(),
            endTimeISO: this.endTime.toISOString(),
            endTimeUtcOffset: this.endTime.utcOffset(),
        }
    }

}