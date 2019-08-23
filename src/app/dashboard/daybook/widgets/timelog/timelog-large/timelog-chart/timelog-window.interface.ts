import { Moment } from 'moment';

export interface TimelogWindow{
    startTime: Moment;
    endTime: Moment;
    windowStartTime: Moment;
    windowEndTime: Moment;
    size: number;
}