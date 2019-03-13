import * as moment from 'moment';

export interface ITimeWindow{
    startTime: moment.Moment;
    endTime: moment.Moment;
    referenceFrom: string;
    /*
        referenceFrom can be "TOP" or "BOTTOM"
    */
}