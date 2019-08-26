import * as moment from 'moment';
import { DayStructureSleepCycleDataItem } from "./day-structure-sleep-cycle-data-item.interface";
import { DayStructureSleepCycleAction } from "./day-structure-sleep-cycle-action.enum";



export default function (dateYYYYMMDD: string): DayStructureSleepCycleDataItem[] {
    let sleepCycleItems: DayStructureSleepCycleDataItem[] = [];
    sleepCycleItems.push({
        sleepAction: DayStructureSleepCycleAction.WakeUp,
        time: moment(dateYYYYMMDD).hour(7).minute(0).second(0).millisecond(0),
    });
    sleepCycleItems.push({
        sleepAction: DayStructureSleepCycleAction.FallAsleep,
        time: moment(dateYYYYMMDD).hour(23).minute(0).second(0).millisecond(0),
    });
    return sleepCycleItems;
}

