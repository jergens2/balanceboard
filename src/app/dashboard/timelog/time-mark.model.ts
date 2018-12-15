import { CategorizedActivity } from "./activities/categorized-activity.model";
import * as moment from 'moment';
import { TimeMarkActivity } from "./time-mark-activity.model";


export class TimeMark{

    public id: string;

    public startTimeISO: string;
    public endTimeISO: string;

    public description: string;
    public activities: TimeMarkActivity[] = [];

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
    set startTime(newStartTime: moment.Moment){
        this.startTimeISO = moment(newStartTime).toISOString();
    }
    get endTime(): moment.Moment{
        return moment(this.endTimeISO);
    }
    set endTime(newEndTime: moment.Moment){
        this.endTimeISO = moment(newEndTime).toISOString();
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

    receiveOldActivities(activities: CategorizedActivity[]){
        console.log("received old activities", activities);
        this.activities = activities.map((activity)=>{
            let timeMarkAcitivty: TimeMarkActivity = new TimeMarkActivity(activity);
            timeMarkAcitivty.duration = 0;
            return timeMarkAcitivty;
        })
    }

}