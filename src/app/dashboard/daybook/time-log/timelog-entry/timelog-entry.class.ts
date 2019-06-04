import { UserDefinedActivity } from "../../../activities/user-defined-activity.model";
import * as moment from 'moment';
// import { TimelogEntryActivity } from "./timelog-entry-activity.class";
import { ITLEActivity } from "./timelog-entry-activity.interface";
import { DurationString } from "../../../../shared/tools/tool-components/timelog-entry-form/duration-string.class";
import { TimelogEntryActivityZZ } from "./timelog-entry-activity.class";
import { ActivitiesService } from "../../../../dashboard/activities/activities.service";


export class TimelogEntry {

    public get httpUpdate(): any{ 
        return {
            id: this.id,
            userId: this.userId,
            startTimeISO: this._startTimeISO,
            endTimeISO: this._endTimeISO,
            description: this.description,
            itleActivities: this.ITLEActivities,
        }
    }
    public get httpSave(): any{ 
        return {
            userId: this.userId,
            startTimeISO: this._startTimeISO,
            endTimeISO: this._endTimeISO,
            description: this.description,
            itleActivities: this.ITLEActivities,
        }
    }
    public get httpDelete(): any{ 
        return {
            id: this.id,
        }
    }

    public id: string;

    private _startTimeISO: string;
    private _endTimeISO: string;
    get startTimeISO(): string {
        return this._startTimeISO;
    }
    get endTimeISO(): string {
        return this._endTimeISO;
    }

    public get isSingleDay(): boolean {
        return this.startTime.format('YYYY-MM-DD') == this.endTime.format('YYYY-MM-DD');
    }

    public description: string;

    // public tleActivities: ITLEActivity[] = []
    private _itleActivities: ITLEActivity[] = [];
    private _tleActivities: TimelogEntryActivityZZ[] = [];
    public get tleActivities(): TimelogEntryActivityZZ[]{
        return this._tleActivities;
    };
    public setTleActivities(itleActivities: ITLEActivity[]){
        this._itleActivities = itleActivities;
        let tleActivities: TimelogEntryActivityZZ[] = [];
        itleActivities.forEach(itleActivity => {
            tleActivities.push(new TimelogEntryActivityZZ(this.activitiesService, itleActivity));
        });
        this._tleActivities = tleActivities;
    }
    public get ITLEActivities(): ITLEActivity[]{
        return this._itleActivities;
    }


    public userId: string;

    private activitiesService: ActivitiesService;

    constructor(id: string, userId: string, startTimeISO: string, endTimeISO: string, description: string, activitiesService: ActivitiesService) {
        this.activitiesService = activitiesService;
        this.id = id;
        this.userId = userId;
        this._startTimeISO = startTimeISO;
        this._endTimeISO = endTimeISO;
        this.description = description;
    }

    get startTime(): moment.Moment {
        return moment(this.startTimeISO);
    }
    // set startTime(newStartTime: moment.Moment){
    //     this.startTimeISO = moment(newStartTime).toISOString();
    // }
    get endTime(): moment.Moment {
        return moment(this.endTimeISO);
    }
    // set endTime(newEndTime: moment.Moment){
    //     this.endTimeISO = moment(newEndTime).toISOString();
    // }
    get durationString(): string {
        return DurationString.calculateDurationString(this.startTime, this.endTime);
    }
    get duration(): number {
        let duration = moment.duration(moment(this.endTime).diff(moment(this.startTime)));
        return duration.asMinutes();
    }

    receiveOldActivities(activities: UserDefinedActivity[]) {
        console.log("this is the receiveOldActivities method", activities);
        // this.activities = activities.map((activity) => {
        //     let timelogEntryActivity: TimelogEntryActivity = new TimelogEntryActivity(activity, "");
        //     // timelogEntryActivity.duration = 0;
        //     if (timelogEntryActivity.activity.color == "blue") {
        //         timelogEntryActivity.activity.color = "#fafafa";
        //     }
        //     return timelogEntryActivity;
        // })
    }

}