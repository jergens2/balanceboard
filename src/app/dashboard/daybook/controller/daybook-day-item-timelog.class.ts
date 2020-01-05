import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { Subject, Observable } from 'rxjs';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { DaybookDayItemHttpShape } from '../api/daybook-day-item-http-shape.interface';

export class DaybookDayItemTimelog {

    constructor(httpShape: DaybookDayItemHttpShape) {
        const timelogEntries: TimelogEntryItem[] = [];
        if (httpShape.daybookTimelogEntryDataItems.length > 0) {
            httpShape.daybookTimelogEntryDataItems.forEach((item) => {
                const timelogEntry: TimelogEntryItem = new TimelogEntryItem(moment(item.startTimeISO), moment(item.endTimeISO));
                timelogEntry.note = item.note;
                if (item.timelogEntryActivities) {
                    item.timelogEntryActivities.forEach((activity) => {
                        timelogEntry.timelogEntryActivities.push(activity);
                    });
                } else {
                    console.log('No TLEAs ?', item);
                }
                timelogEntries.push(timelogEntry);
            });
        }
        // this._dateYYYYMMDD = httpShape.dateYYYYMMDD;
        // this._timelogEntryItems = this.sortTimelogEntries(timelogEntries);
        // this._timeDelineators = httpShape.timeDelineators;
        // this._updateActivityTimes();
    }
    private _dateYYYYMMDD: string;



    public set timeDelineators(timeDelineators: string[]) {
        // console.log("setting Time delineators ")
        // this._timeDelineators = timeDelineators.sort((time1, time2) => {
        //     if (time1 < time2) { return -1; }
        //     if (time1 > time2) { return 1; }
        //     return 0;
        // });
        // this.sendUpdate();
    }
    public addTimeDelineator(delineatorTimeISO: string) {
        const timeDelineators = this.timeDelineators;
        if (timeDelineators.indexOf(delineatorTimeISO) === -1) {
            timeDelineators.push(delineatorTimeISO);
            // this._timeDelineators = timeDelineators.sort((time1, time2) => {
            //     if (time1 < time2) { return -1; }
            //     if (time1 > time2) { return 1; }
            //     return 0;
            // });
        }
    }
    public removeTimeDelineator(delineator: string) {
        const timeDelineators = this.timeDelineators;
        if (timeDelineators.indexOf(delineator) > -1) {
            timeDelineators.splice(timeDelineators.indexOf(delineator), 1);
            // this._timeDelineators = timeDelineators.sort((time1, time2) => {
            //     if (time1 < time2) { return -1; }
            //     if (time1 > time2) { return 1; }
            //     return 0;
            // });
        }
    }
}
