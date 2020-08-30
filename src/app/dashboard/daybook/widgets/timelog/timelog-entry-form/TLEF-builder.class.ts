import { DaybookTimeScheduleItem } from '../../../api/daybook-time-schedule/daybook-time-schedule-item.class';
import { ActivityTree } from '../../../../activities/api/activity-tree.class';
import { TLEFControllerItem } from './TLEF-controller-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';
import { TimelogEntryBuilder } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class';
import { DaybookTimeScheduleStatus } from '../../../api/daybook-time-schedule/daybook-time-schedule-status.enum';
import * as moment from 'moment';

export class TLEFBuilder {
    constructor() {

    }

    public buildItems(scheduleDisplayItems: DaybookTimeScheduleItem[], activityTree: ActivityTree): TLEFControllerItem[] {
        const tlefItems: TLEFControllerItem[] = scheduleDisplayItems.map(scheduleDisplayItem => {
            const startTime = scheduleDisplayItem.startTime;
            const endTime = scheduleDisplayItem.endTime;
            const itemIndex = scheduleDisplayItem.itemIndex;
            const scheduleStatus: DaybookTimeScheduleStatus = scheduleDisplayItem.scheduleStatus;
            let formCase: TLEFFormCase;
            let timelogEntry: TimelogEntryItem;
            let sleepEntry: SleepEntryItem;
            if (scheduleDisplayItem.isSleepItem) {
                formCase = TLEFFormCase.SLEEP;
                sleepEntry = scheduleDisplayItem.sleepEntry;
            } else {
                if (scheduleDisplayItem.isActiveItem) {
                    timelogEntry = scheduleDisplayItem.timelogEntry;
                } else if (scheduleDisplayItem.isAvailableItem) {
                    timelogEntry = new TimelogEntryItem(startTime, endTime);
                }
                formCase = this._determineFormCase(timelogEntry);
            }
            const tleBuilder: TimelogEntryBuilder = new TimelogEntryBuilder();
            const backgroundColor: string = tleBuilder.getBackgroundColor(timelogEntry, activityTree);
            const controllerItem: TLEFControllerItem = new TLEFControllerItem(startTime, endTime, itemIndex,
                formCase, scheduleStatus, backgroundColor, timelogEntry, sleepEntry);
            return controllerItem;
        });
        const newCurrent = tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT);
        const newCurrentFuture = tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT_FUTURE);
        const existingCurrent = tlefItems.find(item => item.formCase === TLEFFormCase.EXISTING_CURRENT);
        if (newCurrent) {
            newCurrent.setAsCurrent();
        } else if (newCurrentFuture) {
            newCurrentFuture.setAsCurrent();
        } else if (existingCurrent) {
            existingCurrent.setAsCurrent();
        }
        return tlefItems;
    }

    private _determineFormCase(entry: TimelogEntryItem): TLEFFormCase {
        let formCase: TLEFFormCase;
        const startTime: moment.Moment = entry.startTime;
        const endTime: moment.Moment = entry.endTime;
        const now: moment.Moment = moment().startOf('minute');
        const isPrevious: boolean = endTime.isBefore(now);
        const isFuture: boolean = startTime.isAfter(now);
        if (isPrevious) {
            if (entry.isSavedEntry) {
                formCase = TLEFFormCase.EXISTING_PREVIOUS;
            } else {
                formCase = TLEFFormCase.NEW_PREVIOUS;
            }
        } else if (isFuture) {
            if (entry.isSavedEntry) {
                formCase = TLEFFormCase.EXISTING_FUTURE;
            } else {
                formCase = TLEFFormCase.NEW_FUTURE;
            }
        } else {
            if (entry.isSavedEntry) {
                formCase = TLEFFormCase.EXISTING_CURRENT;
            } else if (!entry.isSavedEntry) {
                if (now.isSame(startTime)) {
                    formCase = TLEFFormCase.NEW_CURRENT_FUTURE;
                } else if (now.isAfter(startTime)) {
                    formCase = TLEFFormCase.NEW_CURRENT;
                }
            }
        }
        // console.log("CASE IS: " + formCase)
        return formCase;
    }


}
