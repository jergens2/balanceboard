import { TimelogEntryItem } from '../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { Subject, Observable } from 'rxjs';
import { DaybookTimelogEntryDataItem } from './data-items/daybook-timelog-entry-data-item.interface';
import { TimeScheduleItem } from '../../../shared/time-utilities/time-schedule-item.class';

export class DaybookTimelogEntryController {
    constructor(dateYYYYMMDD: string, relevantItems: {
        prevItems: DaybookTimelogEntryDataItem[],
        thisItems: DaybookTimelogEntryDataItem[],
        nextItems: DaybookTimelogEntryDataItem[],
    }) {
        // console.log("Rebuilding Timelog Controller")
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._prevDayItems = relevantItems.prevItems.map(item => this._buildTimelogEntryFromDataItem(item));
        this._thisDayItems = relevantItems.thisItems.map(item => this._buildTimelogEntryFromDataItem(item));
        this._nextDayItems = relevantItems.nextItems.map(item => this._buildTimelogEntryFromDataItem(item));
        this._timelogEntryItems = [...this._prevDayItems, ...this._thisDayItems, ...this._nextDayItems].sort((item1, item2) => {
            if (item1.startTime.isBefore(item2.startTime)) {
                return -1;
            } else if (item1.startTime.isAfter(item2.startTime)) {
                return 1;
            } else {
                return 0;
            }
        });
    }


    private _prevDayItems: TimelogEntryItem[] = [];
    private _thisDayItems: TimelogEntryItem[] = [];
    private _nextDayItems: TimelogEntryItem[] = [];

    private _dateYYYYMMDD: string;
    private _timelogEntryItems: TimelogEntryItem[];


    private _timelogUpdated$: Subject<{ dateYYYYMMDD: string, items: DaybookTimelogEntryDataItem[] }> = new Subject();


    public get lastTimelogEntryItemTime(): moment.Moment {
        if (this._timelogEntryItems.length > 0) {
            return moment(this._timelogEntryItems[this._timelogEntryItems.length - 1].endTime);
        } else {
            return null
        }
    }

    public getTimelogEntryItem(gridItemStart: moment.Moment, gridItemEnd: moment.Moment): TimelogEntryItem {
        const foundItem = this.timelogEntryItems.find((item) => {
            const startsAfterStart = gridItemStart.isSameOrAfter(item.startTime);
            const startsBeforeEnd = gridItemStart.isSameOrBefore(item.endTime);
            const endsAfterStart = gridItemEnd.isSameOrAfter(item.startTime);
            const endsBeforeEnd = gridItemEnd.isSameOrBefore(item.endTime);
            return startsAfterStart && startsBeforeEnd && endsAfterStart && endsBeforeEnd;
        });
        if (foundItem) {
            return foundItem;
        } else {
            console.log('Error: could not find sleep item from grid item.');
            return null;
        }

    }

    public get prevDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get thisDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).format('YYYY-MM-DD'); }
    public get nextDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }
    public get endOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'); }

    public get startOfPrevDate(): moment.Moment { return moment(this.prevDateYYYYMMDD).startOf('day'); }
    public get endOfNextDate(): moment.Moment { return moment(this.nextDateYYYYMMDD).startOf('day').add(24, 'hours'); }


    public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; }


    public getItemAtTime(startTime: moment.Moment): TimelogEntryItem {
        const foundItem = this.timelogEntryItems.find(item => item.startTime.isSame(startTime));
        if (!foundItem) {
            console.log('Error: could not find timelog entry at time: ' + startTime.format('YYYY-MM-DD hh:mm a'))
        }
        return foundItem
    }

    public getNewTLEStartTime(wakeupTime: moment.Moment): moment.Moment {
        const filteredItems = this.timelogEntryItems.filter((item) => {
            return item.startTime.isSameOrAfter(wakeupTime) && item.endTime.isSameOrBefore(this.endOfThisDay)
        });
        if (filteredItems.length > 0) {
            return filteredItems[filteredItems.length - 1].endTime;
        } else {
            return wakeupTime;
        }
    }


    public get timelogUpdated$(): Observable<{ dateYYYYMMDD: string, items: DaybookTimelogEntryDataItem[] }> {
        return this._timelogUpdated$.asObservable();
    }


    public saveTimelogEntryItem(dateYYYYMMDD: string, saveTimelogEntry: TimelogEntryItem){
        let items = this._getDateItem(dateYYYYMMDD);
        items.push(saveTimelogEntry);
        this._sendUpdate({
            dateYYYYMMDD: dateYYYYMMDD,
            items: this._sortItems(items).map(item => item.toDataEntryItem()),
        });
    }

    public updateTimelogEntryItem(dateYYYYMMDD: string, updateTimelogEntry: TimelogEntryItem){
        let items = this._getDateItem(dateYYYYMMDD);
        // console.log("updating from ITEMS:")
        // items.forEach(item=> console.log(item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a')))
        const foundIndex = items.findIndex((item)=>{
            return item.startTime.isSame(updateTimelogEntry.startTime) && item.endTime.isSame(updateTimelogEntry.endTime);
        });
        if(foundIndex > -1){
            // console.log("Found index is " + foundIndex)
            items.splice(foundIndex, 1, updateTimelogEntry);
            this._sendUpdate({
                dateYYYYMMDD: dateYYYYMMDD,
                items: this._sortItems(items).map(item => item.toDataEntryItem()),
            });
        }else{
            console.log('Error updating timelog entry: could not find item.')
        }
    }
    public deleteTimelogEntryItem(dateYYYYMMDD: string, deleteTimelogEntry: TimelogEntryItem){
        let items = this._getDateItem(dateYYYYMMDD);
        const foundIndex = items.findIndex((item)=>{
            return item.startTime.isSame(deleteTimelogEntry.startTime) && item.endTime.isSame(deleteTimelogEntry.endTime);
        });
        if(foundIndex > -1){
            items.splice(foundIndex, 1);
            this._sendUpdate({
                dateYYYYMMDD: dateYYYYMMDD,
                items: this._sortItems(items).map(item => item.toDataEntryItem()),
            });
        }else{
            console.log('Error updating timelog entry: could not find item.')
        }
    }



    private _sendUpdate(updateItem: { dateYYYYMMDD: string, items: DaybookTimelogEntryDataItem[] }) {
        this._timelogUpdated$.next(updateItem);
    }



    private _buildTimelogEntryFromDataItem(dataItem: DaybookTimelogEntryDataItem): TimelogEntryItem {
        const timelogEntry: TimelogEntryItem = new TimelogEntryItem(moment(dataItem.startTimeISO), moment(dataItem.endTimeISO));
        timelogEntry.embeddedNote = dataItem.embeddedNote;
        timelogEntry.timelogEntryActivities = dataItem.timelogEntryActivities;
        // console.log("activities set to: " , timelogEntry.timelogEntryActivities)
        timelogEntry.setIsSaved();
        return timelogEntry;
    }

    private _getDateItem(dateYYYYMMDD: string): TimelogEntryItem[] {
        if (dateYYYYMMDD === this.thisDateYYYYMMDD) {
            return this._thisDayItems;
        } else if (dateYYYYMMDD === this.nextDateYYYYMMDD) {
            return this._nextDayItems;
        } else if (dateYYYYMMDD === this.prevDateYYYYMMDD) {
            return this._prevDayItems;
        }
    }

    private _sortItems(items: TimelogEntryItem[]): TimelogEntryItem[] {
        return items.sort((item1, item2) => {
            if (item1.startTime.isBefore(item2.startTime)) {
                return -1;
            } else if (item1.startTime.isAfter(item2.startTime)) {
                return 1;
            } else {
                return 0;
            }
        });
    }
}
