import * as moment from 'moment';

export interface SleepBatteryConfiguration{
    wakeupTime: moment.Moment;
    bedtime: moment.Moment;
    shape: string; // SMALL or LARGE
}