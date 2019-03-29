
import * as moment from 'moment';
import { UserDefinedActivity } from '../user-defined-activity.model';

export interface IActivityData {
    startTime: moment.Moment;
    endTime: moment.Moment;
    totalMinutes: number;
    totalHours: number;
    minutes: number;
    hours: number;
    activities: {
       activity: UserDefinedActivity,
       durationMinutes: number 
    }[];
}