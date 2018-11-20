import { CategorizedActivity } from "./categorized-activity.model";
import * as moment from 'moment';


export class TimeMark{

    public id: string;
    public timeISO: string;
    public startTimeISO: string;
    public endTimeISO: string;

    // private startTimeMoment: moment.Moment;
    // private endTimeMoment: moment.Moment;
    private timeMoment: moment.Moment;

    public description: string;
    public activities: CategorizedActivity[];

    public precedingTimeMarkId: string;
    public followingTimeMarkId: string;

    public userId: string;

    constructor(id: string, userId: string, timeISO: string, startTimeISO: string, endTimeISO: string){
        this.id = id;
        this.userId = userId;
        this.timeISO = timeISO;
        this.timeMoment = moment(timeISO); 
        // this.startTimeMoment = moment(startTimeISO);
        // this.endTimeMoment = moment(endTimeISO);
        this.startTimeISO = startTimeISO;
        this.endTimeISO = endTimeISO;
    }

    get time(): moment.Moment{
        return this.timeMoment;
    }
    // get startTime(): moment.Moment{
    //     return this.startTimeMoment;
    // }
    // get endTime(): moment.Moment{
    //     return this.endTimeMoment;
    // }
}