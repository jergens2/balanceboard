import { ActivityCategoryDefinition } from "./activity-category-definition.class";
import { ActivityCategoryDefinitionHttpShape } from "./activity-category-definition-http-shape.interface";

export class ActivityBuilder {
    constructor(serverResponseData: any) {
        this._buildActivity(serverResponseData);
    }
    private _activity: ActivityCategoryDefinition;
    private _buildActivity(data: any) {
        const properties: string[] = ["_id", "userId", "treeId", "parentTreeId", "name", "description",
            "color", "icon", "isSleepActivity", "canDelete", "isInTrash", "durationSetting",
            "specifiedDurationMinutes", "scheduleRepititions", "currentPointsConfiguration", "pointsConfigurationHistory",
            "isRoutine", "routineMembersActivityIds", "isConfigured",];
        let dataErrors: boolean = false;
        properties.forEach(property => {
            if (!(property in data)) {
                console.log("Error with activity data object: missing property: ", property);
                dataErrors = true;
            }
        });
        // console.log("Warning: manual overriding")
        // dataErrors = false;
        if (!dataErrors) {
            let buildActivityHttpShape: ActivityCategoryDefinitionHttpShape = {
                _id: data._id,
                userId: data.userId,
                treeId: data.treeId,
                parentTreeId: data.parentTreeId,
                name: data.name,
                description: data.description,
                color: data.color,
                icon: data.icon,
                // isRootLevel: data.isRootLevel,
                isSleepActivity: data.isSleepActivity,
                canDelete: data.canDelete,
                isInTrash: data.isInTrash,
                durationSetting: data.durationSetting,
                specifiedDurationMinutes: data.specifiedDurationMinutes,
                scheduleRepititions: data.scheduleRepititions,
                currentPointsConfiguration: data.currentPointsConfiguration,
                pointsConfigurationHistory: data.pointsConfigurationHistory,
                isConfigured: data.isConfigured,
                isRoutine: data.isRoutine,
                routineMembersActivityIds: data.routineMembersActivityIds,
            }
            this._activity = new ActivityCategoryDefinition(buildActivityHttpShape);
        } else {
            console.log("Activity is not built because of missing property.");
            return null;
        }
    }

    public get constructedActivity(): ActivityCategoryDefinition { return this._activity; }
}