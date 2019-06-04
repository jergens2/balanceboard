import { TimelogEntry } from "../time-log/timelog-entry/timelog-entry.class";
import * as moment from 'moment';

export interface ITimelogEntryFormData{
    action: string;
    timelogEntry: TimelogEntry;
    date: moment.Moment;
}