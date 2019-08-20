import { DayStructureSleepCycle } from "./day-structure-sleep-cycle.enum";
import { DayStructureDataItemType } from "./day-structure-data-item-type.enum";


export interface DayStructureDataItem{
    startTimeISO: string;
    endTimeISO: string;
    bodyLabel: string;
    startLabel: string;
    bodyBackgroundColor: string;
    activityCategoryDefinitionTreeId: string;
    sleepCycle: DayStructureSleepCycle;
    itemType: DayStructureDataItemType;
}