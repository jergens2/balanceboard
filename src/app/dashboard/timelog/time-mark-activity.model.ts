import { CategorizedActivity } from "./activities/categorized-activity.model";
import { ActivitiesService } from "./activities/activities.service";

export class TimeMarkActivity{

    activityTreeId: string;
    duration: number;
    description: string;

    private _activity: CategorizedActivity;
    get activity(): CategorizedActivity{
        return this._activity;
    }
    set activity(activity: CategorizedActivity){
        this._activity = activity;
    }

    constructor(activity: CategorizedActivity, duration: number, description: string){
        this.activityTreeId = activity.treeId;
        this.duration = duration;
        this.description = description;
        this._activity = activity;
    }
}