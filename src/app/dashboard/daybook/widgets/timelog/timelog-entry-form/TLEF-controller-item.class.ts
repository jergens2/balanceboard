import * as moment from 'moment';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';
import { TLEFCircleButton } from './tlef-parts/tlef-circle-buttons-bar/tlef-circle-button.class';
import { DaybookTimeScheduleItem } from '../../../display-manager/daybook-time-schedule/daybook-time-schedule-item.class';
import { DaybookTimeScheduleStatus } from '../../../display-manager/daybook-time-schedule/daybook-time-schedule-status.enum';

export class TLEFControllerItem extends DaybookTimeScheduleItem {

    private _unsavedChanges: boolean = false;
    private _initialTLEValue: TimelogEntryItem;
    private _initialSleepValue: SleepEntryItem;
    private _formCase: TLEFFormCase;

    private _isCurrent: boolean = false;
    private _isCurrentlyOpen: boolean = false;
    private _isDrawing: boolean = false;

    // private _itemStartTime: DaybookItemTimeLimiter;
    // private _itemEndTime: DaybookItemTimeLimiter;

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

    public get circleButton(): TLEFCircleButton { return this._circleButtonItem; }
    public get formCase(): TLEFFormCase { return this._formCase; }
    // public get itemStartTime(): DaybookSchedItemTimeLimiter { return this._itemStartTime; }
    // public get itemEndTime(): DaybookSchedItemTimeLimiter { return this._itemEndTime; }

    // public setItemStartTime(val: DaybookSchedItemTimeLimiter){ this._itemStartTime = val; }
    // public setItemEndTime(val: DaybookSchedItemTimeLimiter){ this._itemEndTime = val; }

    public set isCurrentlyOpen(isOpen: boolean) {
        this._isCurrentlyOpen = isOpen;
        this._circleButtonItem.isCurrentlyOpen = isOpen;
    }

    public get isCurrentlyOpen(): boolean { return this._isCurrentlyOpen; }

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

        return this.schedItemStartTime.format('hh:mm a') + " to " + this.schedItemEndTime.format('hh:mm a') + " : " + this.formCase + " ";

    }
}