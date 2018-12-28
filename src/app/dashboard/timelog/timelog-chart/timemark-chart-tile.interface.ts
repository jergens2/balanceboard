
import { TimeMark } from '../time-mark.model';
import * as moment from 'moment';

export interface ITimeMarkChartTile {
    timeMarks: TimeMark[];
    startTime: moment.Moment;
    endTime: moment.Moment;

}