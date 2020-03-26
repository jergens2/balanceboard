import * as moment from 'moment';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { DisplayGridBarItem } from './daybook-grid-items-bar/display-grid-bar-item.class';
import { DaybookAvailabilityType } from '../../../controller/items/daybook-availability-type.enum';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';

export class TLEFControllerItem {

    private _unsavedChanges: boolean = false;

    private _initialTLEValue: TimelogEntryItem;
    private _initialSleepValue: SleepEntryItem;
    private _formCase: TLEFFormCase;
    private _availability: DaybookAvailabilityType;

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    private _gridBarItem: DisplayGridBarItem;

    constructor(startTime: moment.Moment, endTime: moment.Moment, availability: DaybookAvailabilityType, formCase: TLEFFormCase, timelogEntry: TimelogEntryItem, sleepEntry: SleepEntryItem) {
        this._startTime = moment(startTime);
        this._endTime = moment(endTime);
        this._formCase = formCase;
        this._availability = availability;
        this._gridBarItem = new DisplayGridBarItem(startTime, endTime, availability);
        if(availability === DaybookAvailabilityType.SLEEP){
            this._initialSleepValue = sleepEntry;
        }else{
            this._initialTLEValue = timelogEntry;
        }
    }

    public get gridBarItem(): DisplayGridBarItem { return this._gridBarItem; }

    public getInitialTLEValue(): TimelogEntryItem {
        return Object.assign({}, this._initialTLEValue);
    }
    public getInitialSleepValue(): SleepEntryItem {
        return Object.assign({}, this._initialSleepValue);
    }

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }



}