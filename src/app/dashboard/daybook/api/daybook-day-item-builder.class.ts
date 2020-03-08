import { DaybookDayItem } from './daybook-day-item.class';
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';
import { DaybookTimelogEntryDataItem } from './data-items/daybook-timelog-entry-data-item.interface';

import * as moment from 'moment';
import { TimelogEntryActivity } from './data-items/timelog-entry-activity.interface';
import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import { SleepEnergyLevelInput } from './data-items/energy-level-input.interface';
import { DaybookActivityDataItem } from './data-items/daybook-activity-data-item.interface';
import { DailyTaskListDataItem } from './data-items/daily-task-list-data-item.interface';
import { DayStructureDataItem } from './data-items/day-structure-data-item.interface';
import { DaybookDayItemScheduledActivityItem } from './data-items/daybook-day-item-scheduled-activity.class';
import { DaybookSleepInputDataItem } from './data-items/daybook-sleep-input-data-item.interface';

export class DaybookDayItemBuilder {

    constructor() { 
        
    }

    public buildItemFromResponse(dayItemHttpData: any): DaybookDayItem {
        // console.log("Building item with data: " , dayItemHttpData)
        const id: string = dayItemHttpData._id;
        const userId: string = dayItemHttpData.userId;
        const dateYYYYMMDD: string = dayItemHttpData.dateYYYYMMDD;

        let daybookTimelogEntryDataItems: DaybookTimelogEntryDataItem[] = [];
        if (dayItemHttpData.daybookTimelogEntryDataItems) {
            if (dayItemHttpData.daybookTimelogEntryDataItems.length > 0) {
                daybookTimelogEntryDataItems = dayItemHttpData.daybookTimelogEntryDataItems.map((dataItem: any) => {
                    const startTimeISO: string = dataItem.startTimeISO;
                    const endTimeISO: string = dataItem.endTimeISO;
                    let startUtcOffsetMinutes: number;
                    if (dataItem.startUtcOffsetMinutes) {
                        startUtcOffsetMinutes = dataItem.startUtcOffsetMinutes;
                    } else if (dataItem.utcOffsetMinutes) {
                        // prior to 2019-11-26
                        startUtcOffsetMinutes = dataItem.utcOffsetMinutes;
                    } else { }
                    let timelogEntryActivities: TimelogEntryActivity[] = [];
                    if (dataItem.timelogEntryActivities !== null) {
                        if (dataItem.timelogEntryActivities.length > 0) {
                            timelogEntryActivities = dataItem.timelogEntryActivities.map((tleActivity: any) => {
                                const percentage: number = tleActivity.percentage;
                                const activityTreeId: string = tleActivity.activityTreeId;
                                return {
                                    percentage: percentage,
                                    activityTreeId: activityTreeId,
                                };
                            });
                        }
                    }
                    let note = '';
                    if (dataItem.note !== null) {
                        note = dataItem.note as string;
                    } else if (dataItem.description !== null) {
                        note = dataItem.description as string;
                    }
                    return {
                        startTimeISO: startTimeISO,
                        endTimeISO: endTimeISO,
                        startUtcOffsetMinutes: startUtcOffsetMinutes,
                        timelogEntryActivities: timelogEntryActivities,
                        note: note,
                    };
                });
                daybookTimelogEntryDataItems = dayItemHttpData.daybookTimelogEntryDataItems;
            }
        }

        let timeDelineators: string[] = [];
        if (dayItemHttpData.timeDelineators) {
            if (dayItemHttpData.timeDelineators.length > 0) {
                timeDelineators = dayItemHttpData.timeDelineators;
            }
        }

        let sleepInputItem: DaybookSleepInputDataItem;
        if (dayItemHttpData.sleepInputItem) {
            const data = dayItemHttpData.sleepInputItem;
            sleepInputItem = {
                startSleepTimeISO: data.startSleepTimeISO,
                startSleepTimeUtcOffsetMinutes: data.startSleepTimeUtcOffsetMinutes,
                endSleepTimeISO: data.endSleepTimeISO,
                endSleepTimeUtcOffsetMinutes: data.endSleepTimeUtcOffsetMinutes,
                energyAtStartUserInput: data.energyAtStartUserInput,
                energyAtEndUserInput: data.energyAtEndUserInput,
                percentAsleep: data.percentAsleep,
                embeddedNote: data.embeddedNote,
                noteIds: data.noteIds,
                customSleepProfile: data.customSleepProfile,
            };
        } else {
            console.log('No sleepInputItem property on DB item');
        }

        let sleepEnergyLevelInputs: SleepEnergyLevelInput[] = [];
        if (dayItemHttpData.sleepEnergyLevelInputs) {
            if (dayItemHttpData.sleepEnergyLevelInputs.length > 0) {
                sleepEnergyLevelInputs = dayItemHttpData.sleepEnergyLevelInputs as SleepEnergyLevelInput[];
            }
        }

        let daybookActivityDataItems: DaybookActivityDataItem[] = [];
        if (dayItemHttpData.daybookActivityDataItems) {
            if (dayItemHttpData.daybookActivityDataItems.length > 0) {
                daybookActivityDataItems = dayItemHttpData.daybookActivityDataItems as DaybookActivityDataItem[];
            }
        }

        let dailyTaskListDataItems: DailyTaskListDataItem[] = [];
        if (dayItemHttpData.dailyTaskListDataItems) {
            if (dayItemHttpData.dailyTaskListDataItems.length > 0) {
                dailyTaskListDataItems = dayItemHttpData.dailyTaskListDataItems as DailyTaskListDataItem[];
            }
        }

        let dayStructureDataItems: DayStructureDataItem[] = [];
        if (dayItemHttpData.dayStructureDataItems) {
            if (dayItemHttpData.dayStructureDataItems.length > 0) {
                dayStructureDataItems = dayItemHttpData.dayStructureDataItems as DayStructureDataItem[];
            }
        }

        let scheduledActivityItems: DaybookDayItemScheduledActivityItem[] = [];
        if (dayItemHttpData.scheduledActivityItems) {
            if (dayItemHttpData.scheduledActivityItems.length > 0) {
                scheduledActivityItems = dayItemHttpData.scheduledActivityItems as DaybookDayItemScheduledActivityItem[];
            }
        }

        let sevenDayAwakeToAsleepRatio: number = -1;
        if(dayItemHttpData.sevenDayAwakeToAsleepRatio){
            sevenDayAwakeToAsleepRatio = dayItemHttpData.sevenDayAwakeToAsleepRatio;
        }

        const dailyWeightLogEntryKg: number = dayItemHttpData.dailyWeightLogEntryKg;
        const dayTemplateId: string = dayItemHttpData.dayTemplateId;
        const scheduledEventIds: string[] = dayItemHttpData.scheduledEventIds;
        const notebookEntryIds: string[] = dayItemHttpData.notebookEntryIds;
        const taskItemIds: string[] = dayItemHttpData.taskItemIds;


        const httpShape: DaybookDayItemHttpShape = {
            _id: id,
            userId: userId,
            dateYYYYMMDD: dateYYYYMMDD,
            daybookTimelogEntryDataItems: daybookTimelogEntryDataItems,
            timeDelineators: timeDelineators,
            sleepInputItem: sleepInputItem,
            sleepEnergyLevelInputs: sleepEnergyLevelInputs,
            sevenDayAwakeToAsleepRatio: sevenDayAwakeToAsleepRatio,
            daybookActivityDataItems: daybookActivityDataItems,
            dailyTaskListDataItems: dailyTaskListDataItems,
            dayStructureDataItems: dayStructureDataItems,
            scheduledActivityItems: scheduledActivityItems,
            dailyWeightLogEntryKg: dailyWeightLogEntryKg,
            dayTemplateId: dayTemplateId,
            scheduledEventIds: scheduledEventIds,
            notebookEntryIds: notebookEntryIds,
            taskItemIds: taskItemIds,
        };

        // console.log("Shape is: " , httpShape);

        const newItem: DaybookDayItem = new DaybookDayItem(dateYYYYMMDD);
        newItem.setHttpShape(httpShape);
        // console.log("Returning item: ", newItem)
        return newItem;
    }

}
