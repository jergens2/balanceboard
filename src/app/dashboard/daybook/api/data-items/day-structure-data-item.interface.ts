import { DayStructureSleepCycle } from "./day-structure-sleep-cycle.enum";


export interface DayStructureDataItem{
    startTimeISO: string;
    endTimeISO: string;
    bodyLabel: string;
    startLabel: string;
    bodyBackgroundColor: string;
    activityCategoryDefinitionTreeId: string;
    isDraggable: boolean;
    sleepCycle: DayStructureSleepCycle;
}