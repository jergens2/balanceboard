import * as moment from 'moment';
import { TimeSpanItem } from '../../../../../../shared/utilities/time-utilities/time-span-item.interface';
import { DaybookSleepInputDataItem } from '../../../../api/data-items/daybook-sleep-input-data-item.interface';

export class SleepEntryItem{

    constructor(startTime: moment.Moment, endTime: moment.Moment, dbItem?: DaybookSleepInputDataItem){
        this._startTime = startTime;
        this._endTime = endTime;
        if(dbItem){
            this._startTime = moment(dbItem.startTimeISO);
            this._endTime = moment(dbItem.endTimeISO);
            this.note = dbItem.embeddedNote;
            if(dbItem.noteIds.length > 0){
                console.log("Do something with the note IDs")
            }
            this.percentAsleep = dbItem.percentAsleep;
        }
    }

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;



    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }

    public setEndTime(endTime: moment.Moment){
        this._endTime = moment(endTime);
    }
    public setStartTime(startTime: moment.Moment){
        this._startTime = startTime;
    }
    public note: string = "";

    public percentAsleep: number = 100;


    public get saveToDB(): DaybookSleepInputDataItem{
        return {
            startTimeISO: this.startTime.toISOString(),
            startTimeUtcOffsetMinutes: this.startTime.utcOffset(),
            endTimeISO: this.endTime.toISOString(),
            endTimeUtcOffsetMinutes: this.endTime.utcOffset(),

            energyAtStartUserInput: 0,
            energyAtEndUserInput: 0,
        
            percentAsleep: this.percentAsleep,
        
            embeddedNote: this.note,
            noteIds: [],
        }
    }
}