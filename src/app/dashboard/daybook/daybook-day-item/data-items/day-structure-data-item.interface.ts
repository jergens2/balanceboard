import { DayStructureTimeOfDay } from "./day-structure-time-of-day.enum";


export interface DayStructureDataItem{
    startTimeISO: string;
    endTimeISO: string;
    bodyLabel: string;
    startLabel: string;
    bodyBackgroundColor: string;
    activityCategoryDefinitionTreeId: string;
    timeOfDay: DayStructureTimeOfDay;
}