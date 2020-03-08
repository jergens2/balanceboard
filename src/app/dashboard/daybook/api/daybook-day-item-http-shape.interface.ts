import { DaybookTimelogEntryDataItem } from './data-items/daybook-timelog-entry-data-item.interface';
import { DaybookActivityDataItem } from './data-items/daybook-activity-data-item.interface';
import { DailyTaskListDataItem } from './data-items/daily-task-list-data-item.interface';
import { DayStructureDataItem } from './data-items/day-structure-data-item.interface';


import { DaybookDayItemScheduledActivityItem } from './data-items/daybook-day-item-scheduled-activity.class';
import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import { SleepEnergyLevelInput } from './data-items/energy-level-input.interface';
import { DaybookSleepInputDataItem } from './data-items/daybook-sleep-input-data-item.interface';


export interface DaybookDayItemHttpShape {
    _id: string;
    userId: string;
    dateYYYYMMDD: string;

    // -DataItem suffix types are data which represent the actual record in the database, not a reference.
    daybookTimelogEntryDataItems: DaybookTimelogEntryDataItem[];
    timeDelineators: string[];

    sleepInputItem: DaybookSleepInputDataItem;
    sleepEnergyLevelInputs: SleepEnergyLevelInput[];
    
    sevenDayAwakeToAsleepRatio: number;

    daybookActivityDataItems: DaybookActivityDataItem[];
    dailyTaskListDataItems: DailyTaskListDataItem[];
    dayStructureDataItems: DayStructureDataItem[];

    scheduledActivityItems: DaybookDayItemScheduledActivityItem[];  // this includes activities and routines.

    dailyWeightLogEntryKg: number;

    // These represent references to data stored in other tables in the database.




    dayTemplateId: string;
    scheduledEventIds: string[];
    notebookEntryIds: string[];
    taskItemIds: string[];











    // incident occurrences:  e.g. THC, cigarettes, alcoholic drinks, etc. pushups done, etc.
    // a.k.a. activity occurrences
    // perhaps these should just be of type ActivityCategoryDefinition, but add properties to accommodate "timeless" activity incidences.
    // or is it better as a separate CRUD API object type?  THC for example:  whats more important to measure?  how often it occurrs or for how many minutes per day: "i did THC for 20 minutes" doesn't really provide alot of useful information
    // whereas if you had data which said "you did THC 7 times today, starting at 10:00am, then at 11:30am, etc. etc.", "in an average day you take THC every hour and a half after starting"
    // how do we measure data to answer those questions?
    // to be continued...
    //

    //Other things to add into the day item:
    //
    // Daily gratitude journal.  Could simply be a note?  then add the ID as a separate property.  Gratitude Note ID
    // Daily objectives:  what needs to get done today?  Could be just an alternate thing for the taskItemIds.  Not sure yet.


}
