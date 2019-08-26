import { DayStructureSleepCycleAction } from "./day-structure-sleep-cycle-action.enum";
import * as moment from 'moment';

export interface DayStructureSleepCycleDataItem{
    sleepAction: DayStructureSleepCycleAction;
    time: moment.Moment;
}