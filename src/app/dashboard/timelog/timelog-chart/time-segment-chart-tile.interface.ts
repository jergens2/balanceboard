
import { TimeSegment } from '../time-segment.model';
import * as moment from 'moment';

export interface ITimeSegmentChartTile {
    timeSegments: TimeSegment[];
    startTime: moment.Moment;
    endTime: moment.Moment;

}