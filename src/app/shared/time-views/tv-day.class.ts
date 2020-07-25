import * as moment from 'moment';
import { TimeViewItem } from './time-view-item.class';

export class TimeViewDay{
    
    private _dateYYYYMMDD: string = "";
    private _value: string = "";

    public isVisibleMonthItem: boolean = true;
    
    constructor(dateYYYYMMDD: string, dayItems: TimeViewItem[]){
        this._dateYYYYMMDD = dateYYYYMMDD;
        
        let value = 0;
        dayItems.forEach(item =>{
            value += item.durationMs;
        });
        value = value / (1000 * 60 * 60);
        if(value === 0){
            this._value = "";
        }else{
            this._value = value.toFixed(1) + " hrs";
        }
        
    }

    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get value(): string { return this._value; }
}