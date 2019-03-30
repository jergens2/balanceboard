import { ScheduleRepitition } from "./schedule-repitition.model";
import * as moment from 'moment';
import { UserDefinedActivity } from "../../activities/user-defined-activity.model";

export class ScheduledTimeEvent{


    private _repititions: ScheduleRepitition[] = [];

    public addRepitition(repitition: ScheduleRepitition){
        this._repititions.push(repitition);
    }
    public removeRepitition(repitition: ScheduleRepitition){
        let index = this._repititions.indexOf(repitition);
        if(index >= 0){
            this._repititions.splice(index);    
        }else{
            console.log("Could not find this repitition in the repititions array");
        }
    }

    startsOn: moment.Moment;
    occurrences: number = 0;
    endsOn: moment.Moment;

    activity: UserDefinedActivity;

    constructor(){

    }





}