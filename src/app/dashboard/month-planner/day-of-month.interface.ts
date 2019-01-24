import * as moment from 'moment';

export interface IDayOfMonth{
    date: moment.Moment;
    style: any;
    isThisMonth: boolean;
}