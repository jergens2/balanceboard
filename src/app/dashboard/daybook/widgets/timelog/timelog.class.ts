import { DaybookDayItem } from "../../api/daybook-day-item.class";
import * as moment from 'moment';
import { TimelogEntryForm } from "./timelog-entry-form/timelog-entry-form.class";

export class Timelog{
    /**
     * Timelog class exists to facilitate the entry of timelog entries, keeping track of Timelog Entry items.
     * @param activeDay active date DaybookDayItem
     */
    constructor(activeDay: DaybookDayItem){
        this._activeDay = activeDay;

        this.buildTimelogEntryForm();
    }
    private _activeDay: DaybookDayItem;

    previousDayFallAsleepTime: moment.Moment;
    wakeUpTime: moment.Moment;
    weightLogEntryKg: number;

    private buildTimelogEntryForm(){
        let timelogEntryForm: TimelogEntryForm = new TimelogEntryForm(this._activeDay.dateYYYYMMDD);

        this._timelogEntryForm = timelogEntryForm;
    }

    private _timelogEntryForm: TimelogEntryForm;
    public get timelogEntryForm(): TimelogEntryForm{
        return this._timelogEntryForm;
    }



}