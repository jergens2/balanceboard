import * as moment from 'moment';
import { DurationString } from './duration-string.class';
import { TimeScheduleItem } from './time-schedule-item.class';
export class TimeSchedule{

    private _startTime: moment.Moment; 
    private _endTime: moment.Moment;

    public get startTime(): moment.Moment { return moment(this._startTime); }
    public get startTimeISO(): string { return moment(this._startTime).toISOString(); }
    public get startDateYYYYMMDD(): string { return moment(this._startTime).format('YYYY-MM-DD'); }
    public get endTime(): moment.Moment { return moment(this._endTime); }
    public get endTimeISO(): string { return moment(this._endTime).toISOString(); }
    public get endDateYYYYMMDD(): string { return moment(this._endTime).format('YYYY-MM-DD'); }
    public get sameDateYYYYMMDD(): boolean { return this.startDateYYYYMMDD === this.endDateYYYYMMDD; }

    public get durationMs(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }
    public get durationString(): string { return DurationString.getDurationStringFromMS(this.durationMs); }


    /**
     * A generic class to represent a range of time and an array of items
     */
    constructor(startTime: moment.Moment, endTime: moment.Moment){
        // console.log("Constructing time schedule: " + startTime.format('YYYY-MM-DD hh:mm a') + ' to ' + endTime.format('YYYY-MM-DD hh:mm a'))
        if(startTime.isBefore(endTime)){
            this._startTime = moment(startTime);
            this._endTime = moment(endTime);
        }else{
            console.log("Error with times");
        }
    }

    /**
     *  this method is essentially a static method for DaybookSleepCycle.
     */
    getInverseItems(scheduleItems: TimeScheduleItem[]): TimeScheduleItem[]{
        // console.log("Getting inverse items: " , scheduleItems)
        scheduleItems = scheduleItems.sort((item1, item2)=>{
            if(item1.startTime.isBefore(item2.startTime)){ return -1; }
            else if(item1.startTime.isAfter(item2.startTime)) { return 1;}
            else return 0;
        });
        let inverseValueItems: TimeScheduleItem[] = [];
        let currentTime = moment(this.startTime);
        if(scheduleItems.length > 0){
            if(currentTime.isBefore(scheduleItems[0].startTime)){
                inverseValueItems.push(new TimeScheduleItem(this.startTimeISO, scheduleItems[0].startTimeISO));
                currentTime = moment(scheduleItems[0].endTime);
            }
            if(scheduleItems.length > 1){
                for(let i=1; i<scheduleItems.length; i++){
                    if(currentTime.isBefore(scheduleItems[i].startTime)){
                        inverseValueItems.push(new TimeScheduleItem(currentTime.toISOString(), scheduleItems[i].startTimeISO));
                        currentTime = moment(scheduleItems[i].endTime);
                    }
                }
            }
            if(currentTime.isBefore(this.endTime)){
                inverseValueItems.push(new TimeScheduleItem(currentTime.toISOString(), this.endTimeISO));
            }
        }else{
            return [
                new TimeScheduleItem(this.startTimeISO, this.endTimeISO)
            ];
        }
        return inverseValueItems;
    }


}