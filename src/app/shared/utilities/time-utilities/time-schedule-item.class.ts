import * as moment from 'moment';

export class TimeScheduleItem<T>{
    constructor(startTime: moment.Moment, endTime: moment.Moment, hasValue: boolean, value: T){ 
        this.startTime = startTime;
        this.endTime = endTime;
        if(hasValue === true){
            if(value){
                this.value = value;
            }else{
                // console.log('Error: no value provided');
            }
        }
    }

    public toString(): string{
        return " " + this.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.endTime.format('YYYY-MM-DD hh:mm a') + " hasValue?: " + this.hasValue;
    }
    /**
     * Default value is 0 for all items.  Higher number is higher priority.
     */
    public priority: number = 0;


    public value: T = null;

    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public get hasValue(): boolean { return this.value !== null }; 

    public get durationMS(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }
}