import * as moment from 'moment';
import { DaybookAvailabilityType } from '../../../../controller/items/daybook-availability-type.enum';
import { TimeScheduleItem } from '../../../../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimelogEntryItem } from '../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { SleepEntryItem } from '../sleep-entry-form/sleep-entry-item.class';
import { Subject } from 'rxjs';


export class DisplayGridBarItem {

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _daybookAvailabilty: DaybookAvailabilityType;
    /**
     * An alternative name might be TimelogEntryFormDisplayGridBarItem or TLEFDisplayGridBarItem
     * 
     * The grid bar items are for the timelog entry form.
     */
    constructor(startTime: moment.Moment, endTime: moment.Moment, availability: DaybookAvailabilityType) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._daybookAvailabilty = availability;
    }

    private _mouseIsOver: boolean = false;

    public get mouseIsOver(): boolean { return this._mouseIsOver; }
    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public get availabilityType(): DaybookAvailabilityType { return this._daybookAvailabilty; }

    public isCurrent = false;
    public isActive = false;

    public index = -1;

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


    onMouseEnter() {
        this._mouseIsOver = true;
    }
    onMouseLeave() {
        this._mouseIsOver = false;
    }

    // private _click$: Subject<DisplayGridBarItem> = new Subject();
    // public onClick(){
    //     this._click$.next(this);
    // }
    // public get click$(){ return this._click$.asObservable();}


}