import { Moment } from 'moment';

export interface TimelogWindow{
    startTime: Moment;
    endTime: Moment;
    size: number;
}