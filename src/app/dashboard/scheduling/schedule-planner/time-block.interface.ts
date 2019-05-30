import * as moment from 'moment';

export interface ITimeBlock{
    startTime: moment.Moment,
    endTime: moment.Moment,
    style: any,
    isSelected: boolean,
}