import * as moment from 'moment';

export interface IActivityJournalItem {
    startTime: moment.Moment;
    endTime: moment.Moment;
    description: string;
    timelogEntryActivitesCount: number;
}