import * as moment from 'moment';
import { TimeViewMonth } from './tv-month.class';
import { TimeViewItem } from './time-view-item.class';

export class TimeViewYear{
    
    private _startDateYYYYMMDD: string = "";
    private _months: TimeViewMonth[] = [];

    public get months(): TimeViewMonth[] { return this._months; }

    constructor(startDateYYYYMMDD: string, items: TimeViewItem[]){
        this._startDateYYYYMMDD = moment(startDateYYYYMMDD).startOf('year').format('YYYY-MM-DD');
        const lastDateYYYYMMDD = moment(this._startDateYYYYMMDD).endOf('year').format('YYYY-MM-DD');
        let months: TimeViewMonth[] = [];
        for(let i=0; i<12; i++){
            const startOfMonthYYYYMMDD = moment(this._startDateYYYYMMDD).add(i, 'months').format('YYYY-MM-DD');
            const monthItems = items.filter(item => moment(item.dateYYYYMMDD).month() === i);
            months.push(new TimeViewMonth(startOfMonthYYYYMMDD, monthItems));
        }
        this._months = months;
    }
}