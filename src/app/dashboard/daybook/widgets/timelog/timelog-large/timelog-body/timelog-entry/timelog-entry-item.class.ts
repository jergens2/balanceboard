import * as moment from 'moment';

export class TimelogEntryItem{
    constructor(startTime, endTime){
        this._startTime = startTime;
        this._endTime = endTime;
    }

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }

    public get durationSeconds(): number{
        return this._endTime.diff(this._startTime, "seconds");
    }

    private _sleepState: "SLEEP" | "AWAKE" = "AWAKE";
    public get sleepState(): "SLEEP" | "AWAKE" { return this._sleepState; }

          /*
          startTimeISO: string;
          endTimeISO: string;
          utcOffsetMinutes: number;
          timelogEntryActivities: TimelogEntryActivity[];
          isConfirmed: boolean;
          note: string;    
      */
    
}