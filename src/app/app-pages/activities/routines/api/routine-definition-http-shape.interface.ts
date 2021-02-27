import { RoutineDefinitionFrequency } from "./routine-definition-frequency.interface";
import { TimeOfDay } from "../../../../shared/time-utilities/time-of-day-enum";

export interface RoutineDefinitionHttpShape{
    _id: string,
    userId: string,
    routineTreeId: string,
    name: string,
    frequencies: RoutineDefinitionFrequency[],
    timeOfDay: TimeOfDay,
    timeOfDayRanges: {
        startTimeISO: string,
        endTimeISO: string,
    }[],
    activityIds: string[],
    childOfRoutineId: string,
    
}