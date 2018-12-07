import { CategorizedActivity } from "./activities/activity/categorized-activity.model";
import * as moment from 'moment';


export class TimeMark{

    public id: string;

    public startTimeISO: string;
    public endTimeISO: string;

    public description: string;
    public activities: CategorizedActivity[];

    public precedingTimeMarkId: string;
    public followingTimeMarkId: string;

    public userId: string;

    constructor(id: string, userId: string, startTimeISO: string, endTimeISO: string){
        this.id = id;
        this.userId = userId;
        this.startTimeISO = startTimeISO;
        this.endTimeISO = endTimeISO;
    }

    get startTime(): moment.Moment{
        return moment(this.startTimeISO);
    }
    get endTime(): moment.Moment{
        return moment(this.endTimeISO);
    }
    get durationString(): string{
        let duration = moment.duration(this.endTime.diff(this.startTime));
        let durationString = '';
        if(duration.hours() > 0){
          duration.hours() == 1 ? durationString += "1 hour " : durationString += (duration.hours() + " hours ");
        }
        if(duration.minutes() > 0){
          duration.minutes() == 1 ? durationString += "1 minute " : durationString += (duration.minutes() + " minutes ");
        }else{
          durationString += "0 minutes";
        }
        return durationString;
    }
    get duration(): number{
        let duration = moment.duration(this.endTime.diff(this.startTime));
        return duration.asMinutes();
    }
    
}