import { ActivityCategoryDefinition } from "../../../activities/api/activity-category-definition.class";
import * as moment from 'moment';
import { ActivityDefinitionTree } from "../../../activities/api/activity-definition-tree.class";

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
        this.markedComplete = this._scheduledActivityItem.isComplete;
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
    public markComplete(){
        const time: moment.Moment = moment();
        this._scheduledActivityItem.timeMarkedCompleteISO = time.toISOString();
        this._scheduledActivityItem.isComplete = true;
    }
    public markIncomplete(){
        this._scheduledActivityItem.timeMarkedCompleteISO = "";
        this._scheduledActivityItem.isComplete = false;
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
    public setRoutineMembers(activityTree: ActivityDefinitionTree){
        let routineMemberActivities : DaybookDayItemScheduledActivity[] = [];
        this.routineMemberActivityItems.forEach((memberItem: DaybookDayItemScheduledActivityItem)=>{
            let activityDefinition: ActivityCategoryDefinition = activityTree.findActivityByTreeId(memberItem.activityTreeId);
            if(activityDefinition){
                let newMemberItem: DaybookDayItemScheduledActivity = new DaybookDayItemScheduledActivity(memberItem, activityDefinition);
                routineMemberActivities.push(newMemberItem);
            }
        });
        // console.log("Setting routine member activities: ", routineMemberActivities);
        this._routineMemberActivities = routineMemberActivities;
    }
    public get routineMemberActivities(): DaybookDayItemScheduledActivity[] {
        return this._routineMemberActivities;
    }

    public updateFullRoutineCompletionStatus(){
        if(this.isRoutine){
            let allRoutineMemberActivitiesComplete: boolean = true;
            this._routineMemberActivities.forEach((item)=>{
                if(!item.isComplete){
                    allRoutineMemberActivitiesComplete = false;
                }
            });
            if(allRoutineMemberActivitiesComplete){
                this.markComplete();
            }else{
                this.markIncomplete();
            }
        }
    }


    private _mouseIsOver: boolean = false;
    public get mouseIsOver(): boolean{
        return this._mouseIsOver;
    }
    public onMouseEnter(){
        this._mouseIsOver = true;
    }
    public onMouseLeave(){
        this._mouseIsOver = false;
    }

    public markedComplete: boolean = false;
    public onClickCircle(){
        this.markedComplete = !this.markedComplete;
    }

    public saveChanges(){
        console.log("Saving changes to: " , this.name);
        if(this.markedComplete){
            console.log("the item was marked as complete, so saving as complete")
            this.markComplete();
        }else if(!this.markedComplete){
            console.log("THE ITEM WAS NOT MARKED AS COMPLETE, SO MARKING INCOMPLETE")
            this.markIncomplete();
        }
    }

}