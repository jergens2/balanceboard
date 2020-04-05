import * as moment from 'moment';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { DisplayGridBarItem } from './daybook-grid-items-bar/display-grid-bar-item.class';
import { DaybookAvailabilityType } from '../../../controller/items/daybook-availability-type.enum';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';
import { TimelogDelineator } from '../timelog-delineator.class';

export class TLEFControllerItem {

    private _unsavedChanges: boolean = false;

    private _initialTLEValue: TimelogEntryItem;
    private _initialSleepValue: SleepEntryItem;
    private _formCase: TLEFFormCase;
    private _availability: DaybookAvailabilityType;

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    private _startDelineator: TimelogDelineator;
    private _endDelineator: TimelogDelineator;

    private _gridBarItem: DisplayGridBarItem;

    constructor(
        startTime: moment.Moment,
        endTime: moment.Moment,
        availability: DaybookAvailabilityType,
        formCase: TLEFFormCase,
        timelogEntry: TimelogEntryItem,
        sleepEntry: SleepEntryItem,
        startDelineator: TimelogDelineator,
        endDelineator: TimelogDelineator) {

        this._startTime = moment(startTime);
        this._endTime = moment(endTime);
        this._formCase = formCase;
        this._availability = availability;
        this._gridBarItem = new DisplayGridBarItem(startTime, endTime, availability);
        this._startDelineator = startDelineator;
        this._endDelineator = endDelineator;

        this._initialSleepValue = sleepEntry;
        this._initialTLEValue = timelogEntry;
    }

    public get gridBarItem(): DisplayGridBarItem { return this._gridBarItem; }
    public get availability(): DaybookAvailabilityType { return this._availability; }
    public get formCase(): TLEFFormCase { return this._formCase; }
    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public get startDelineator(): TimelogDelineator { return this._startDelineator; }
    public get endDelineator(): TimelogDelineator { return this._endDelineator; }

    public get isActive(): boolean { return this._isActive; }

    public getInitialTLEValue(): TimelogEntryItem {
        const newTLE = new TimelogEntryItem(this._initialTLEValue.startTime, this._initialTLEValue.endTime);
        newTLE.timelogEntryActivities = this._initialTLEValue.timelogEntryActivities;
        newTLE.note = this._initialTLEValue.note;
        return newTLE;
    }
    public getInitialSleepValue(): SleepEntryItem {
        return this._initialSleepValue;
    }


    private _isActive: boolean = false;
    private _isCurrent: boolean = false;

    public setAsActive() {
        this._isActive = true;
        this._gridBarItem.isActive = true;
    }

    public setAsNotActive() {
        this._isActive = false;
        this._gridBarItem.isActive = false;
    }

    public isSame(otherItem: TLEFControllerItem): boolean {
        const sameStart = this.startTime.isSame(otherItem.startTime);
        const sameEnd = this.endTime.isSame(otherItem.endTime);
        const sameCase = this.formCase === otherItem.formCase;
        const sameAvailability = this.availability === otherItem.availability;
        return (sameStart && sameEnd && sameCase && sameAvailability);
    }
    


}