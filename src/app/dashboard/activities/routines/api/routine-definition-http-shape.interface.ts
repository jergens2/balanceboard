import { RoutineDefinitionFrequency } from "./routine-definition-frequency.interface";
import { TimeOfDay } from "../../../../shared/time-utilities/time-of-day-enum";
import { TimeRange } from "../../../../shared/time-utilities/time-range.interface";

export interface RoutineDefinitionHttpShape{
    _id: string,
    userId: string,
    routineTreeId: string,
    name: string,
    frequencies: RoutineDefinitionFrequency[],
    timeOfDay: TimeOfDay,
    timeOfDayRanges: TimeRange[],
    activityIds: string[],
    childOfRoutineId: string,
    
}