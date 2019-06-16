
import * as moment from 'moment';

export interface TimeViewDayData{
    dateYYYYMMDD: string,
    date: moment.Moment,
    value: number,
    name: string,
    style: any,
    isHighlighted: boolean,
    mouseOver: boolean,
}