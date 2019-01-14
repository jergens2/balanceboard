import * as moment from 'moment';

export interface ICalendarDay{

    style: any;
    date: moment.Moment;
    isThisMonth: boolean;
    isToday: boolean;

}