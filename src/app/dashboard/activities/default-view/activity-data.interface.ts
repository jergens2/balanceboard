
import * as moment from 'moment';
import { ActivityCategoryDefinition } from '../../../shared/document-definitions/activity-category-definition/activity-category-definition.class';

export interface IActivityData {
    startTime: moment.Moment;
    endTime: moment.Moment;
    totalMinutes: number;
    totalHours: number;
    minutes: number;
    hours: number;
    activities: {
       activity: ActivityCategoryDefinition,
       durationMinutes: number 
    }[];
}