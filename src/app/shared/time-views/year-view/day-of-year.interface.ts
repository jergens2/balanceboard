import { Day } from "../../../dashboard/daybook/day/day.model";
import * as moment from 'moment';

export interface IDayOfYear{
    date: moment.Moment,
    dayObjectData: Day,
    style: any,
    isHighlighted: boolean,
}