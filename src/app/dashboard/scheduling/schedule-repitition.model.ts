import { RepititionIncrement } from "./repitition-increment.enum";
import * as moment from 'moment';

export class ScheduleRepitition {



    startHour: number = 0;
    startMinute: number = 0;

    endHour: number = 0;
    endMinute: number = 0;



    repeatsEvery: number = 0;
    increment: RepititionIncrement;

    constructor(repeatsEvery: number, increment: RepititionIncrement, startHour: number, startMinute: number, endHour: number, endMinute: number){
        this.repeatsEvery = repeatsEvery;
        this.increment = increment;

        this.startHour = startHour;
        this.startMinute = startMinute;
        this.endHour = endHour;
        this.endMinute = endMinute;

    }

    public get durationMinutes(): number {

        let endTime = moment().hour(this.endHour).minute(this.endMinute).second(0).millisecond(0);
        let startTime = moment().hour(this.startHour).minute(this.startMinute).second(0).millisecond(0);

        return moment(endTime).diff(moment(startTime), "minutes");
    }

}