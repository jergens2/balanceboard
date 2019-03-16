import { TimeSegment } from "./time-segment.model";
import * as moment from 'moment';

export interface ITimeSegmentTile{

    timeSegment: TimeSegment;
    style: any;
    startTime: moment.Moment;
    endTime: moment.Moment;
    // occurrence: string;
    

}