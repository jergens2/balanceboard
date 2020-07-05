import * as moment from 'moment';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../timelog-delineator.class';
import { TLEFGridBarItem } from './tlef-parts/tlef-grid-items-bar/tlef-grid-bar-item.class';

export class TLEFControllerItem {

    private _unsavedChanges: boolean = false;

    private _initialTLEValue: TimelogEntryItem;
    private _initialSleepValue: SleepEntryItem;
    private _formCase: TLEFFormCase;
    private _isAvailable: boolean;

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    // private _startDelineator: TimelogDelineator;
    // private _endDelineator: TimelogDelineator;

    private _gridBarItem: TLEFGridBarItem;

    constructor(
        startTime: moment.Moment,
        endTime: moment.Moment,
        isAvailable: boolean,
        isDrawing: boolean,
        formCase: TLEFFormCase,
        timelogEntry: TimelogEntryItem,
        sleepEntry: SleepEntryItem,
        backgroundColor: string) {

        this._startTime = moment(startTime);
        this._endTime = moment(endTime);
        this._formCase = formCase;
        this._isAvailable = isAvailable;
        this._isDrawing = isDrawing;
        this._gridBarItem = new TLEFGridBarItem(startTime, endTime, isAvailable, formCase, backgroundColor);

        // this._startDelineator = startDelineator;
        // this._endDelineator = endDelineator;

        this._initialSleepValue = sleepEntry;
        this._initialTLEValue = timelogEntry;


        if (this._isDrawing) {
            // console.log("TLEF controller item: isDrawing === true")
            this._isDrawing = true;
            this._gridBarItem.isDrawing = true;
        }
    }

    public get gridBarItem(): TLEFGridBarItem { return this._gridBarItem; }
    public get isAvailable(): boolean { return this._isAvailable; }
    public get formCase(): TLEFFormCase { return this._formCase; }
    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    // public get startDelineator(): TimelogDelineator { return this._startDelineator; }
    // public get endDelineator(): TimelogDelineator { return this._endDelineator; }

    public get isActive(): boolean { return this._isActive; }

    public get isSleepItem(): boolean { return this.formCase === TLEFFormCase.SLEEP; }
    public get isTLEItem(): boolean { return this.formCase !== TLEFFormCase.SLEEP; }

    public setAsCurrent(){
        this._isCurrent = true;
            this._gridBarItem.isCurrent = true;
    }
    public getInitialTLEValue(): TimelogEntryItem {
        const newTLE = new TimelogEntryItem(this._initialTLEValue.startTime, this._initialTLEValue.endTime);
        newTLE.timelogEntryActivities = this._initialTLEValue.timelogEntryActivities;
        newTLE.embeddedNote = this._initialTLEValue.embeddedNote;
        if (this._initialTLEValue.isSavedEntry) { newTLE.setIsSaved(); }
        return newTLE;
    }
    public getInitialSleepValue(): SleepEntryItem {
        return this._initialSleepValue;
    }

    private _unsavedTLEChanges: TimelogEntryItem;
    public setUnsavedTLEChanges(tle: TimelogEntryItem) {
        this._unsavedChanges = true;
        const newTLE = new TimelogEntryItem(tle.startTime, tle.endTime);
        newTLE.timelogEntryActivities = tle.timelogEntryActivities;
        newTLE.embeddedNote = tle.embeddedNote;
        if (tle.isSavedEntry) { newTLE.setIsSaved(); }
        this._unsavedTLEChanges = newTLE;
    }
    public getUnsavedTLEChanges(): TimelogEntryItem {
        return this._unsavedTLEChanges;
    }
    public unsavedChanges(): boolean {
        return this._unsavedChanges;
    }

    private _isActive: boolean = false;
    private _isCurrent: boolean = false;

    private _isDrawing: boolean = false;

    public setAsActive() {
        this._isActive = true;
        this._gridBarItem.isActive = true;
    }

    public setAsNotActive() {
        this._isActive = false;
        this._gridBarItem.isActive = false;
    }

    // public setAsDrawing() {
    //     this._isDrawing = true;
    // }
    public get isDrawing(): boolean { return this._isDrawing; }

    public isSame(otherItem: TLEFControllerItem): boolean {
        const sameStart = this.startTime.isSame(otherItem.startTime);
        const sameEnd = this.endTime.isSame(otherItem.endTime);
        // const sameCase = this.formCase === otherItem.formCase;
        // const sameAvailability = this.isAvailable === otherItem.isAvailable;
        // return (sameStart && sameEnd && sameCase && sameAvailability);
        return (sameStart && sameEnd);
    }
    public isSimilar(otherItem: TLEFControllerItem): boolean {
        const sameStart = this.startTime.isSame(otherItem.startTime);
        const sameEnd = this.endTime.isSame(otherItem.endTime);
        return sameStart || sameEnd;
    }


    public toString(): string {

        return this.startTime.format('hh:mm a') + " to " + this.endTime.format('hh:mm a') + " : " + this.formCase + " ";

    }
}