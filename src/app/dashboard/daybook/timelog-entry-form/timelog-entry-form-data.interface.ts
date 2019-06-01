import { TimelogEntry } from "../time-log/timelog-entry-tile/timelog-entry.model";
import * as moment from 'moment';

export interface ITimelogEntryFormData{
    action: string;
    timelogEntry: TimelogEntry;
    date: moment.Moment;
}