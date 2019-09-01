import { ActivityDurationSetting } from "./activity-duration.enum";
import { ActivityTargetConfiguration } from "./activity-target-configuration.interface";

export interface ActivityCategoryDefinitionHttpShape{
    _id: string;
    userId: string;

    treeId: string;
    parentTreeId: string;

    name: string;
    description: string;
    color: string;
    icon: string;
    
    durationSetting: ActivityDurationSetting;
    specifiedDurationMinutes: number;
    targets: ActivityTargetConfiguration[];
}