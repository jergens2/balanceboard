import * as moment from 'moment';

export interface IDailyTaskListDataItem {
    recurringTaskId: string,
    isComplete: boolean,
    completionDate: moment.Moment;
}