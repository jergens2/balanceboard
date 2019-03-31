import * as moment from 'moment';
import { ITemplateTimeRange } from './template-time-range.interface';

export class DayTemplate{


    id: string;
    name: string; // can be anything, but basic ones will be "Weekend", "Work day", "School day", "Holiday", etc.
    userId: string;



    sleepTimeRanges: ITemplateTimeRange[] = null
    nonDiscretionaryTimeRanges: ITemplateTimeRange[] = null;
    discretionaryTimeRanges: ITemplateTimeRange[] = null;
    

    /*
        what about "Somewhat-Discretionary" time, such as routine stuff like Gym, Cooking, Cleaning, Chores, Errands, etc.

        Would those be Scheduled times, which would ultimately fall under nonDiscretionary, or would they be their own range?
    */


    constructor(id: string, userId: string, name: string, sleepTimeRanges:ITemplateTimeRange[], nonDiscretionaryTimeRanges:ITemplateTimeRange[], discretionaryTimeRanges:ITemplateTimeRange[]){
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.sleepTimeRanges = Object.assign([], sleepTimeRanges);
        this.nonDiscretionaryTimeRanges = Object.assign([], nonDiscretionaryTimeRanges);
        this.discretionaryTimeRanges = Object.assign([], discretionaryTimeRanges);
    }




}