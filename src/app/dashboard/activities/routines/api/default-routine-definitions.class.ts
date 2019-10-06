import { RoutineDefinition } from "./routine-definition.class";
import { Guid } from "../../../../shared/utilities/guid.class";
import { TimeUnit } from "../../../../shared/utilities/time-utilities/time-unit.enum";
import { TimeOfDay } from "../../../../shared/utilities/time-utilities/time-of-day-enum";
import * as moment from 'moment';

export class DefaultRoutineDefinitions{
    

    public static defaultRoutineDefinitions(userId: string, defaultMorningRoutineActivityIds: string[], defaultEveningRoutineActivityIds: string []): RoutineDefinition[] {
        console.log("I don't think we need this any more.")
        let routineDefinitions: RoutineDefinition[] = [];
        routineDefinitions.push(new RoutineDefinition({
            _id: "",
            userId: userId,
            routineTreeId: userId+"_"+Guid.newGuid(),
            name: "Morning Routine",
            frequencies: [{
                value: 1,
                unit: TimeUnit.Day,
                startsOnDateYYYYMMDD: moment().startOf("year").format("YYYY-MM-DD"),
            }],
            timeOfDay: TimeOfDay.Morning,
            timeOfDayRanges: [],
            activityIds: defaultMorningRoutineActivityIds,
            childOfRoutineId: "TOP_LEVEL",
        }));

        routineDefinitions.push(new RoutineDefinition({
            _id: "",
            userId: userId,
            routineTreeId: userId+"_"+Guid.newGuid(),
            name: "Evening Routine",
            frequencies: [{
                value: 1,
                unit: TimeUnit.Day,
                startsOnDateYYYYMMDD: moment().startOf("year").format("YYYY-MM-DD"),
            }],
            timeOfDay: TimeOfDay.Evening,
            timeOfDayRanges: [],
            activityIds: defaultEveningRoutineActivityIds,
            childOfRoutineId: "TOP_LEVEL",
        }));


        return routineDefinitions;
    }
}