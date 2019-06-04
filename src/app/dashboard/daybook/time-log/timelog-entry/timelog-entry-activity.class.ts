import { UserDefinedActivity } from "../../../activities/user-defined-activity.model";
import { ActivitiesService } from "../../../activities/activities.service";
import { ITLEActivity } from "./timelog-entry-activity.interface";

export class TimelogEntryActivity{

    activityTreeId: string;
    durationMinutes: number = 0;

    private _activity: UserDefinedActivity;
    get activity(): UserDefinedActivity{
        return this.activitiesService.findActivityByTreeId(this.activityTreeId);
    }

    private activitiesService: ActivitiesService;

    constructor(activitiesService: ActivitiesService, itleActivity: ITLEActivity){
        this.activitiesService = activitiesService;
        this.activityTreeId = itleActivity.activityTreeId;
        this.durationMinutes = itleActivity.durationMinutes;
    }
}