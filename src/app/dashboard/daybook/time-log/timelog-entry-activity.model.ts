import { UserDefinedActivity } from "../../activities/user-defined-activity.model";
import { ActivitiesService } from "../../activities/activities.service";

export class TimelogEntryActivity{

    activityTreeId: string;
    description: string;




    private _activity: UserDefinedActivity;
    get activity(): UserDefinedActivity{
        // console.log("returning activity", this._activity)
        return this._activity;
    }
    set activity(activity: UserDefinedActivity){
        this._activity = activity;
    }

    constructor(activity: UserDefinedActivity, description: string){
        if(activity != null){
            this.activityTreeId = activity.treeId;
            this.description = description;
            this._activity = activity;
        }else{
            console.log("activity provided to constructor was null.  is this a problem?")
        }

    }
}