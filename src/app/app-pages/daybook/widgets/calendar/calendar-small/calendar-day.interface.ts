import * as moment from 'moment';

export interface CalendarDay{

    date: moment.Moment;
    isThisMonth: boolean;
    isToday: boolean;
    isActiveDay: boolean;
    season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
}