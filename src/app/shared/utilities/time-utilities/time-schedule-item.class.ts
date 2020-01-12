import * as moment from 'moment';

export class TimeScheduleItem{
    constructor(startTime: moment.Moment, endTime: moment.Moment, hasValue: boolean){ 
        this.startTime = startTime;
        this.endTime = endTime;
        this.hasValue = hasValue;
    }
    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public hasValue: boolean; 
}