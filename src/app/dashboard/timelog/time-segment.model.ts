import { UserDefinedActivity } from "../activities/user-defined-activity.model";
import * as moment from 'moment';
import { TimeSegmentActivity } from "./time-segment-activity.model";


export class TimeSegment{

    public id: string;

    private _startTimeISO: string;
    private _endTimeISO: string;
    get startTimeISO(): string {
        return this._startTimeISO;
    }
    get endTimeISO(): string {
        return this._endTimeISO;
    }

    public description: string;

    public activities: TimeSegmentActivity[] = []
    // private _activities: TimeSegmentActivity[] = [];
    // get activities(): TimeSegmentActivity[]{
    //     return this._activities;
    // }
    // set activities(arr: TimeSegmentActivity[]){
    //     this._activities = [];
    //     this._activities = Object.assign([], arr);
    //     console.log(this._activities);
    // }

    public precedingTimeSegmentId: string;
    public followingTimeSegmentId: string;

    public userId: string;

    constructor(id: string, userId: string, startTimeISO: string, endTimeISO: string){
        this.id = id;
        this.userId = userId;
        this._startTimeISO = startTimeISO;
        this._endTimeISO = endTimeISO;
    }

    get startTime(): moment.Moment{
        return moment(this.startTimeISO);
    }
    // set startTime(newStartTime: moment.Moment){
    //     this.startTimeISO = moment(newStartTime).toISOString();
    // }
    get endTime(): moment.Moment{
        return moment(this.endTimeISO);
    }
    // set endTime(newEndTime: moment.Moment){
    //     this.endTimeISO = moment(newEndTime).toISOString();
    // }
    get durationString(): string{
        let duration = moment.duration(moment(this.endTime).diff(moment(this.startTime)));
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
        let duration = moment.duration(moment(this.endTime).diff(moment(this.startTime)));
        return duration.asMinutes();
    }

    receiveOldActivities(activities: UserDefinedActivity[]){
        this.activities = activities.map((activity)=>{
            let timeSegmentActivity: TimeSegmentActivity = new TimeSegmentActivity(activity, 0, "");
            timeSegmentActivity.duration = 0;
            if(timeSegmentActivity.activity.color == "blue"){
                timeSegmentActivity.activity.color = "#fafafa";
            }
            return timeSegmentActivity;
        })
    }

}