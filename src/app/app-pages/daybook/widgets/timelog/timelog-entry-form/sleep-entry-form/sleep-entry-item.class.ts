import * as moment from 'moment';
import { TimeSpanItem } from '../../../../../../shared/time-utilities/time-span-item.interface';
import { DaybookSleepInputDataItem } from '../../../../daybook-day-item/data-items/daybook-sleep-input-data-item.interface';
import { TimelogEntryActivity } from '../../../../daybook-day-item/data-items/timelog-entry-activity.interface';
// import { DaybookEnergyItem } from '../../../../controller/items/daybook-energy-item.class';

export class SleepEntryItem {

    constructor(startTime: moment.Moment, endTime: moment.Moment, inputItem?: DaybookSleepInputDataItem) {
        // console.log("Constructing sleep entry item: ", dateYYYYMMDD, startTime.format('YYYY-MM-DD hh:mm a') + " to " + endTime.format("YYYY-MM-DD hh:mm a"), inputItem )
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

            if (inputItem.energyAtEnd) {
                this._energyAtEnd = inputItem.energyAtEnd;
            }

            this.note = inputItem.embeddedNote;
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

    private _activityItems: TimelogEntryActivity[] = [];


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

    public changeEndTime(time: moment.Moment) { this._endTime = moment(time); }
    public changeStartTime(time: moment.Moment) { this._startTime = moment(time); }

    public getEnergyAtTime(timeToCheck: moment.Moment): number {
        const diffHours = moment(timeToCheck).diff(this.startTime, 'milliseconds') / (1000 * 60 * 60);
        const diffEnergy = diffHours * this.energyRateOfChangePerHour;
        return this.energyAtStart + diffEnergy;
    }




    // public setEndTime(endTime: moment.Moment, asleepHoursPerDay: number) {
    //     // AKA setWakeupTime
    //     this._endTime = moment(endTime);
    //     this._endTimeIsSaved = true;
    //     if (!this._startTimeIsSaved) {
    //         // if there was no fall asleep time set.
    //         this._startTime = moment(this._endTime).subtract(asleepHoursPerDay, 'hours');
    //         this._startTimeIsSaved = true;
    //     }
    // }
    // public setStartTime(startTime: moment.Moment, asleepHoursPerDay?: number, saveFollowingEndTime = false) {
    //     // AKA setFallAsleepTime
    //     this._startTime = startTime;
    //     this._startTimeIsSaved = true;

    //     if (saveFollowingEndTime) {
    //         this._endTime = moment(this._startTime).add(asleepHoursPerDay, 'hours');
    //         this._endTimeIsSaved = true;
    //     }
    // }
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

    // public getEnergyItem(): DaybookEnergyItem {
    //     return new DaybookEnergyItem(this.startTime, this.endTime, this._energyAtStart, this.energyRateOfChangePerHour);
    // }

    public exportToDataItem(): DaybookSleepInputDataItem {
        return {
            startSleepTimeISO: this.startTime.toISOString(),
            startSleepTimeUtcOffsetMinutes: this.startTime.utcOffset(),
            endSleepTimeISO: this.endTime.toISOString(),
            endSleepTimeUtcOffsetMinutes: this.endTime.utcOffset(),

            energyAtEnd: this.energyAtEnd,

            percentAsleep: this.percentAsleep,

            embeddedNote: this.note,

            activities: this._activityItems,
        }
    }
}