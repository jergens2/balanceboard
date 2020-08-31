import * as moment from 'moment';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';
import { TLEFCircleButton } from './tlef-parts/tlef-circle-buttons-bar/tlef-circle-button.class';
import { DaybookTimeScheduleItem } from '../../../api/daybook-time-schedule/daybook-time-schedule-item.class';
import { DaybookTimeScheduleStatus } from '../../../api/daybook-time-schedule/daybook-time-schedule-status.enum';

export class TLEFControllerItem extends DaybookTimeScheduleItem {

    private _unsavedChanges: boolean = false;
    private _initialTLEValue: TimelogEntryItem;
    private _initialSleepValue: SleepEntryItem;
    private _formCase: TLEFFormCase;

    private _isCurrent: boolean = false;
    private _isDrawing: boolean = false;

    // private _startDelineator: TimelogDelineator;
    // private _endDelineator: TimelogDelineator;

    private _circleButtonItem: TLEFCircleButton;

    constructor(startTime: moment.Moment, endTime: moment.Moment, itemIndex: number,
        formCase: TLEFFormCase, scheduleStatus: DaybookTimeScheduleStatus, backgroundColor: string,
        timelogEntry: TimelogEntryItem, sleepEntry: SleepEntryItem) {
        super(startTime, endTime);
        this._itemIndex = itemIndex;
        this._scheduleStatus = scheduleStatus;
        this._formCase = formCase;
        this._circleButtonItem = new TLEFCircleButton(itemIndex, scheduleStatus, formCase, backgroundColor);
        this._initialSleepValue = sleepEntry;
        this._initialTLEValue = timelogEntry;
    }

    public get gridBarItem(): TLEFCircleButton { return this._circleButtonItem; }
    public get formCase(): TLEFFormCase { return this._formCase; }

    public isCurrentlyOpen: boolean = false;

    public get isSleepItem(): boolean { return this.formCase === TLEFFormCase.SLEEP; }
    public get isTLEItem(): boolean { return this.formCase !== TLEFFormCase.SLEEP; }

    public setAsCurrent() {
        this._isCurrent = true;
        this._circleButtonItem.setAsCurrent();
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
    public get unsavedTLEChanges(): TimelogEntryItem { return this._unsavedTLEChanges; }
    public get hasUnsavedChanges(): boolean { return this._unsavedChanges; }
    public get isDrawing(): boolean { return this._isDrawing; }
    public toString(): string {

        return this.startTime.format('hh:mm a') + " to " + this.endTime.format('hh:mm a') + " : " + this.formCase + " ";

    }
}