import * as moment from 'moment';

export interface SleepBatteryConfiguration{
    fallAsleepTime: moment.Moment;
    wakeupTime: moment.Moment;
    bedtime: moment.Moment;
}