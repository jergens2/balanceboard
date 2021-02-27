import * as moment from 'moment';

export interface SleepBatteryConfiguration{
    previousFallAsleepTime: moment.Moment;
    
    wakeupTime: moment.Moment;
    bedtime: moment.Moment;
}