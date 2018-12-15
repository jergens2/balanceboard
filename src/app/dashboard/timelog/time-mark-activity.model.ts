import { CategorizedActivity } from "./activities/categorized-activity.model";
import { ActivitiesService } from "./activities/activities.service";

export class TimeMarkActivity{

    activityTreeId: string;
    duration: number;

    private _activity: CategorizedActivity;
    get activity(): CategorizedActivity{
        return this._activity;
    }
    set activity(activity: CategorizedActivity){
        this._activity = activity;
    }

    constructor(activity: CategorizedActivity, ){
        this.activityTreeId = activity.treeId;
        this.duration = 0;
        this._activity = activity;
    }
}