import * as moment from 'moment';
import { DaybookAvailabilityType } from '../../../../controller/items/daybook-availability-type.enum';
import { TimeScheduleItem } from '../../../../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimelogEntryItem } from '../../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { SleepEntryItem } from '../../sleep-entry-form/sleep-entry-item.class';


export class DisplayGridBarItem {

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _daybookAvailabilty: DaybookAvailabilityType;
    /**
     * An alternative name might be TimelogEntryFormDisplayGridBarItem or TLEFDisplayGridBarItem
     * 
     * The grid bar items are for the timelog entry form.
     */
    constructor(timeScheduleItem: TimeScheduleItem<DaybookAvailabilityType>) {
        this._startTime = timeScheduleItem.startTime;
        this._endTime = timeScheduleItem.endTime;
        this._daybookAvailabilty = timeScheduleItem.value;
    }

    private _mouseIsOver: boolean = false;
    onMouseEnter() {
        this._mouseIsOver = true;
    }
    onMouseLeave() {
        this._mouseIsOver = false;
    }
    public get mouseIsOver(): boolean { return this._mouseIsOver; }
    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public get availabilityType(): DaybookAvailabilityType { return this._daybookAvailabilty; }

    public isCurrent = false;

    public timelogEntry: TimelogEntryItem;
    public sleepEntry: SleepEntryItem;

    public get isSleepItem(): boolean { 
        return this._daybookAvailabilty === DaybookAvailabilityType.SLEEP;
    }
    public get isTimelogEntryItem(): boolean { 
        return this._daybookAvailabilty === DaybookAvailabilityType.TIMELOG_ENTRY;
    }
    public get isAvailable(): boolean { 
        return this._daybookAvailabilty === DaybookAvailabilityType.AVAILABLE;
    }
}