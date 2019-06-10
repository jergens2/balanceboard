import { ActivityCategoryDefinition } from "../../document-definitions/activity-category-definition/activity-category-definition.class";
import { ActivityCategoryDefinitionService } from "../../document-definitions/activity-category-definition/activity-category-definition.service";
import { ITLEActivity } from "./timelog-entry-activity.interface";

export class TimelogEntryActivity{

    activityTreeId: string;
    durationMinutes: number = 0;

    private _activity: ActivityCategoryDefinition;
    get activity(): ActivityCategoryDefinition{
        return this.activityCategoryDefinitionService.findActivityByTreeId(this.activityTreeId);
    }

    private activityCategoryDefinitionService: ActivityCategoryDefinitionService;

    constructor(activityCategoryDefinitionService: ActivityCategoryDefinitionService, itleActivity: ITLEActivity){
        this.activityCategoryDefinitionService = activityCategoryDefinitionService;
        this.activityTreeId = itleActivity.activityTreeId;
        this.durationMinutes = itleActivity.durationMinutes;
    }
}