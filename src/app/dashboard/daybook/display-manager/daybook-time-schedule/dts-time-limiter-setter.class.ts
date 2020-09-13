import * as moment from 'moment';
import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { DTSItemTimeLimiter } from './dts-item-time-limiter.class';


export class DTSTimeLimiterSetter {

    private _finalizedItems: DaybookTimeScheduleItem[];
    /**
     * This class will take all of the combined various types of DaybookTimeScheduleItem, and apply the time limiters to it.
     * the time limiters are controllers that assist with the modifying of the startTime or endTime of an item.
     * 
     * In its current form, this applies a generally a strict system that allows for the modification of times INTO AVAILABLE SPACE only,
     * as in, if a sleep entry is followed by a timelog entry, this will ensure that that set of end time and start time are not able to be changed.
     */
    constructor(items: DaybookTimeScheduleItem[]) {
        this._setLimiters(items);
    }

    public get finalizedItems(): DaybookTimeScheduleItem[] { return this._finalizedItems; }
    /**
     *
     *
     *  if it is the first or last item in the display, then they are fixed,
     *
     * otherwise, all limiters are fixed except for on available items or AROUND available items.
     *
     * e.g. a timelog entry can be modified if the time it is being modified around is available.
     *
     * otherwise, if not available, then it is the limit.  in the future this can be expanded to include better modification functionality.
     *
     *
     *
     *
     */
    private _setLimiters(items: DaybookTimeScheduleItem[]) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemStartTime: moment.Moment = moment(item.schedItemStartTime);
            const itemEndTime: moment.Moment = moment(item.schedItemEndTime);
            const nextBusyTime = this._getNextBusyTime(item, items);
            const prevBusyTime = this._getPrevBusyTime(item, items);
            const limiter = new DTSItemTimeLimiter(itemStartTime, itemEndTime, nextBusyTime, prevBusyTime);
            item.setTimeLimiter(limiter);
        }
        this._finalizedItems = items;
    }

    private _getNextBusyTime(fromItem: DaybookTimeScheduleItem, allItems: DaybookTimeScheduleItem[]): moment.Moment {
        let index = fromItem.itemIndex + 1;
        let endFound: boolean = false;
        let currentLimit: moment.Moment = moment(fromItem.schedItemEndTime);
        while (!endFound && index <= allItems.length - 1) {
            if (allItems[index].scheduleStatus !== DaybookTimeScheduleStatus.AVAILABLE) {
                endFound = true;
                currentLimit = moment(allItems[index].schedItemStartTime);
            }
            index++;
        }
        return currentLimit;
    }
    private _getPrevBusyTime(fromItem: DaybookTimeScheduleItem, allItems: DaybookTimeScheduleItem[]): moment.Moment {
        let index = fromItem.itemIndex - 1;
        let endFound: boolean = false;
        let currentLimit: moment.Moment = moment(fromItem.schedItemStartTime);
        while (!endFound && index >= 0) {
            if (allItems[index].scheduleStatus !== DaybookTimeScheduleStatus.AVAILABLE) {
                endFound = true;
                currentLimit = moment(allItems[index].schedItemEndTime);
            }
            index--;

        }
        return currentLimit;
    }

    // private _getStartTimeLimiter(item: DaybookTimeScheduleItem): DaybookItemTimeLimiter {

    //     return new DaybookItemTimeLimiter();
    // }
    // private _getEndTimeLimiter(item: DaybookTimeScheduleItem): DaybookItemTimeLimiter {
    //     return new DaybookItemTimeLimiter();
    // }
}