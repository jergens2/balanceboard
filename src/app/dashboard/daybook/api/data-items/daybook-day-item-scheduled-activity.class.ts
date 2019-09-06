import { ActivityCategoryDefinition } from "../../../activities/api/activity-category-definition.class";
import * as moment from 'moment';
import { ActivityTree } from "../../../activities/api/activity-tree.class";

export interface DaybookDayItemScheduledActivityItem{
    activityTreeId: string;
    isComplete: boolean;
    targetMinutes: number;
    timeMarkedCompleteISO: string;
    routineMemberActivities: DaybookDayItemScheduledActivityItem[]; 
}
export class DaybookDayItemScheduledActivity{


    constructor(activityItem: DaybookDayItemScheduledActivityItem, activityDefinition: ActivityCategoryDefinition){
        this._scheduledActivityItem = activityItem;
        this._activityDefinition = activityDefinition;
    }

    private _scheduledActivityItem: DaybookDayItemScheduledActivityItem;
    private _activityDefinition: ActivityCategoryDefinition; 

    public get name(): string{
        return this._activityDefinition.name;
    }
    public get isRoutine(): boolean{
        return this._activityDefinition.isRoutine;
    }

    public get scheduledActivityItem(): DaybookDayItemScheduledActivityItem{
        return this._scheduledActivityItem;
    }
    public get activityTreeId(): string{
        return this._activityDefinition.treeId;
    }
    public get activityDefinition(): ActivityCategoryDefinition{
        return this._activityDefinition;
    }

    public get isComplete(): boolean{
        return this._scheduledActivityItem.isComplete;
    }
    public get timeMarkedComplete(): moment.Moment{
        return moment(this._scheduledActivityItem.timeMarkedCompleteISO);
    }
    public get timeMarkedCompletedISO(): string{
        return this._scheduledActivityItem.timeMarkedCompleteISO;
    }
    public get targetMinutes(): number{
        return this._scheduledActivityItem.targetMinutes;
    }
    public get routineMemberActivityItems(): DaybookDayItemScheduledActivityItem[]{
        return this._scheduledActivityItem.routineMemberActivities;
    }

    private _routineMemberActivities: DaybookDayItemScheduledActivity[] = [];
    public setRoutineMembers(activityTree: ActivityTree){
        let routineMemberActivities : DaybookDayItemScheduledActivity[] = [];
        this.routineMemberActivityItems.forEach((memberItem: DaybookDayItemScheduledActivityItem)=>{
            let activityDefinition: ActivityCategoryDefinition = activityTree.findActivityByTreeId(memberItem.activityTreeId);
            if(activityDefinition){
                let newMemberItem: DaybookDayItemScheduledActivity = new DaybookDayItemScheduledActivity(memberItem, activityDefinition);
                routineMemberActivities.push(newMemberItem);
            }
        });
        console.log("Setting routine member activities: ", routineMemberActivities);
        this._routineMemberActivities = routineMemberActivities;
    }
    public get routineMemberActivities(): DaybookDayItemScheduledActivity[] {
        return this._routineMemberActivities;
    }

}