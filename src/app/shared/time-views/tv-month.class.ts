import * as moment from 'moment';
import { TimeViewDayItem } from './time-view-day-item.class';

export class TimeViewMonth{

    private _days: TimeViewDayItem[] = [];
    private _name: string = "";

    public get days(): TimeViewDayItem[] { return this._days;}
    public get name(): string { return this._name; }
    constructor(startDateYYYYMMDD: string, monthItems: TimeViewDayItem[]){
        let viewMode: 'NOTEBOOK' | 'ACTIVITY' = 'NOTEBOOK';
        if(monthItems.length >0){
            viewMode = monthItems[0].viewMode;
        }
        let currentDateYYYYMMDD = startDateYYYYMMDD;
        let currentDayOfWeek = moment(currentDateYYYYMMDD).day();

        const month = moment(startDateYYYYMMDD).month();
        this._name = moment(startDateYYYYMMDD).format('MMMM');
        if(currentDayOfWeek !== 0){
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).subtract(currentDayOfWeek, 'days').format('YYYY-MM-DD');
        }
        let days: TimeViewDayItem[] = [];
        for(let i=0; i<42; i++){
            let day = monthItems.find(item => item.dateYYYYMMDD === currentDateYYYYMMDD);
            if(!day){
                day = new TimeViewDayItem(currentDateYYYYMMDD, 0, 0, viewMode);
            }
            if(moment(day.dateYYYYMMDD).month() !== month){
                day.setInvisibleMonthDay();
            }
            days.push(day);
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        }
        this._days = days;  
    }
    
}