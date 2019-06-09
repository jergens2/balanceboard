import { DayData } from "../../document-data/day-data/day-data.class";
import * as moment from 'moment';

export interface IDayOfYear{
    date: moment.Moment,
    dayData: DayData,
    style: any,
    isHighlighted: boolean,
}