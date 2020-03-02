import * as moment from 'moment';
import { TimeSpanItem } from '../../../../../../shared/utilities/time-utilities/time-span-item.interface';
import { DaybookSleepInputDataItem } from '../../../../api/data-items/daybook-sleep-input-data-item.interface';

export class SleepEntryItem{

    constructor(startTime: moment.Moment, endTime: moment.Moment, inputItem?: DaybookSleepInputDataItem){
        this._startTime = startTime;
        this._endTime = endTime;
        if(inputItem){
            this._isSavedEntry = true;
            if(inputItem.startSleepTimeISO){
                this._startTimeIsSaved = true;
            }
            if(inputItem.endSleepTimeISO){
                this._endTimeIsSaved = true;
            }

            this.note = inputItem.embeddedNote;
            if(inputItem.noteIds.length > 0){
                console.log("Do something with the note IDs")
            }
            this.percentAsleep = inputItem.percentAsleep;
        }
    }

    private _isSavedEntry: boolean = false;

    public unsavedChanges: boolean = false;

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _startTimeIsSaved: boolean = false;
    private _endTimeIsSaved: boolean = false;


    public get isSavedEntry(): boolean { return this._isSavedEntry; }

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    

    public get startTimeIsSaved(): boolean { return this._startTimeIsSaved; }
    public get endTimeIsSaved(): boolean { return this._endTimeIsSaved; }


    public setEndTime(endTime: moment.Moment){
        this._endTime = moment(endTime);
    }
    public setStartTime(startTime: moment.Moment){
        this._startTime = startTime;
    }
    public note: string = "";
    public percentAsleep: number = 100;

    public timeIsIn(timeToCheck: moment.Moment){
        return timeToCheck.isSameOrAfter(this.startTime) && timeToCheck.isBefore(this.endTime);
    }

    public get saveToDB(): DaybookSleepInputDataItem{
        return {

            startSleepTimeISO: this.startTime.toISOString(),
            startSleepTimeUtcOffsetMinutes: this.startTime.utcOffset(),
            endSleepTimeISO: this.endTime.toISOString(),
            endSleepTimeUtcOffsetMinutes: this.endTime.utcOffset(),

            energyAtStartUserInput: 0,
            energyAtEndUserInput: 0,
        
            percentAsleep: this.percentAsleep,
        
            embeddedNote: this.note,
            noteIds: [],

            customSleepProfile: {},
        }
    }
}