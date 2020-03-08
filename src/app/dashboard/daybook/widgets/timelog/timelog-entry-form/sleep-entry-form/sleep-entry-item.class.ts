import * as moment from 'moment';
import { TimeSpanItem } from '../../../../../../shared/utilities/time-utilities/time-span-item.interface';
import { DaybookSleepInputDataItem } from '../../../../api/data-items/daybook-sleep-input-data-item.interface';
import { DaybookEnergyItem } from '../../../../controller/items/daybook-energy-item.class';

export class SleepEntryItem {

    private _dateYYYYMMDD: string
    constructor(dateYYYYMMDD: string, startTime: moment.Moment, endTime: moment.Moment, inputItem?: DaybookSleepInputDataItem) {
        // console.log("Constructing sleep entry item: ", dateYYYYMMDD, startTime.format('YYYY-MM-DD hh:mm a') + " to " + endTime.format("YYYY-MM-DD hh:mm a"), inputItem )
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._startTime = startTime;
        this._endTime = endTime;
        if (inputItem) {
            this._isSavedEntry = true;
            if (inputItem.startSleepTimeISO) {
                this._startTimeIsSaved = true;
            }
            if (inputItem.endSleepTimeISO) {
                this._endTimeIsSaved = true;
            }
            if (inputItem.energyAtStartUserInput) {
                this._energyAtStart = inputItem.energyAtStartUserInput;
            }
            if (inputItem.energyAtEndUserInput) {
                this._energyAtEnd = inputItem.energyAtEndUserInput;
            }

            this.note = inputItem.embeddedNote;
            if (inputItem.noteIds.length > 0) {
                console.log("Do something with the note IDs");
            }
            this.percentAsleep = inputItem.percentAsleep;
        }
    }

    private _energyAtStart: number = 0;
    private _energyAtEnd: number = 1;


    private _isSavedEntry: boolean = false;

    public unsavedChanges: boolean = false;

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _startTimeIsSaved: boolean = false;
    private _endTimeIsSaved: boolean = false;


    public get isSavedEntry(): boolean { return this._isSavedEntry; }

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }

    public get energyAtStart(): number { return this._energyAtStart; }
    public get energyAtEnd(): number { return this._energyAtEnd; }
    public get energyDifference(): number { return this.energyAtEnd - this.energyAtStart; }

    public get durationHours(): number { return (moment(this._endTime).diff(this._startTime, 'milliseconds') / (1000 * 60 * 60)); }
    public get durationMs(): number { return (moment(this._endTime).diff(this._startTime, 'milliseconds')); }


    public get startTimeIsSaved(): boolean { return this._startTimeIsSaved; }
    public get endTimeIsSaved(): boolean { return this._endTimeIsSaved; }

    public get energyRateOfChangePerHour(): number { return this.energyDifference / this.durationHours; }

    public getAwakeToAsleepRatio(): number {
        const awakeHours = 24 - this.durationHours;
        return awakeHours / this.durationHours;
    }

    public getEnergyAtTime(timeToCheck: moment.Moment): number {
        const diffHours = moment(timeToCheck).diff(this.startTime, 'milliseconds') / (1000 * 60 * 60);
        const diffEnergy = diffHours * this.energyRateOfChangePerHour;
        return this.energyAtStart + diffEnergy;
    }




    public setEndTime(endTime: moment.Moment) {
        this._endTime = moment(endTime);
    }
    public setStartTime(startTime: moment.Moment) {
        this._startTime = startTime;
    }
    public note: string = "";
    public percentAsleep: number = 100;

    public timeIsIn(timeToCheck: moment.Moment) {
        return timeToCheck.isSameOrAfter(this.startTime) && timeToCheck.isBefore(this.endTime);
    }

    // public getEnergyItem(): DaybookEnergyItem {
    //     let startEnergy = 0;
    //     let endEnergy = 1;
    //     if (this._energyAtStartUserInput) {
    //         startEnergy = this._energyAtStartUserInput;
    //     } 
    //     if (this._energyAtEndUserInput) {
    //         endEnergy = this._energyAtEndUserInput;
    //     } 
    //     const diffMs = moment(this.endTime).diff(this.startTime, 'milliseconds');
    //     const diffHours = diffMs / (1000*60*60) 
    //     const rateOfChangePerHour = (endEnergy - startEnergy) / diffHours;
    //     const energyItem = new DaybookEnergyItem(this.startTime, this.endTime, startEnergy, rateOfChangePerHour);
    //     return energyItem;
    // }

    public getEnergyItem(): DaybookEnergyItem {
        return new DaybookEnergyItem(this.startTime, this.endTime, this._energyAtStart, this.energyRateOfChangePerHour);
    }

    public exportToDataItem(): DaybookSleepInputDataItem {
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