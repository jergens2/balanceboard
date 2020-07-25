import * as moment from 'moment';
import { TimeViewDay } from './tv-day.class';
import { TimeViewItem } from './time-view-item.class';

export class TimeViewMonth{

    private _days: TimeViewDay[] = [];
    private _name: string = "";

    public get days(): TimeViewDay[] { return this._days;}
    public get name(): string { return this._name; }
    constructor(startDateYYYYMMDD: string, monthItems: TimeViewItem[]){ 
        let currentDateYYYYMMDD = startDateYYYYMMDD;
        let currentDayOfWeek = moment(currentDateYYYYMMDD).day();

        const month = moment(startDateYYYYMMDD).month();
        this._name = moment(startDateYYYYMMDD).format('MMMM');
        if(currentDayOfWeek !== 0){
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).subtract(currentDayOfWeek, 'days').format('YYYY-MM-DD');
        }
        let days: TimeViewDay[] = [];
        for(let i=0; i<42; i++){
            const dayItems = monthItems.filter(item => item.dateYYYYMMDD === currentDateYYYYMMDD);
            const newDay = new TimeViewDay(currentDateYYYYMMDD, dayItems);
            if(moment(currentDateYYYYMMDD).month() !== month){
                newDay.isVisibleMonthItem = false;
            }
            days.push(newDay);
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        }
        this._days = days;  
    }
    
}