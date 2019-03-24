import { TimeSegment } from "../time-log/time-segment.model";
import * as moment from 'moment';

export interface ITimeSegmentFormData{
    action: string;
    timeSegment: TimeSegment;
    date: moment.Moment;
}