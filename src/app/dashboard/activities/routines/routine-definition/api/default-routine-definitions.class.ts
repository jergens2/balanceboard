import { RoutineDefinition } from "./routine-definition.class";
import { Guid } from "../../../../../shared/utilities/guid.class";
import { TimeUnit } from "../../../../../shared/utilities/time-unit.enum";
import { TimeOfDay } from "../../../../../shared/utilities/time-of-day-enum";

export class DefaultRoutineDefinitions{
    
    public static defaultRoutineDefinitions(userId: string): RoutineDefinition[] {

        let routineDefinitions: RoutineDefinition[] = [];
        routineDefinitions.push(new RoutineDefinition({
            _id: "",
            userId: userId,
            routineTreeId: userId+"_"+Guid.newGuid(),
            name: "Morning Routine",
            frequency: {
                value: 1,
                unit: TimeUnit.Day,
            },
            timeOfDay: TimeOfDay.Morning,
            timeOfDayRanges: [],
            activityIds: [

            ],
            childOfRoutineId: "TOP_LEVEL",
        }));

        routineDefinitions.push(new RoutineDefinition({
            _id: "",
            userId: userId,
            routineTreeId: userId+"_"+Guid.newGuid(),
            name: "Evening Routine",
            frequency: {
                value: 1,
                unit: TimeUnit.Day,
            },
            timeOfDay: TimeOfDay.Evening,
            timeOfDayRanges: [],
            activityIds: [
                
            ],
            childOfRoutineId: "TOP_LEVEL",
        }));


        return routineDefinitions;
    }
}