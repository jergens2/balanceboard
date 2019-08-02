import { ActivityCategoryDefinition } from "./activity-category-definition.class";

export class ActivityTree {
    /*
        The tree is strictly a model used by the front end and not something that has any data about it saved on the DB.
    */


    private _rootActivities: ActivityCategoryDefinition[];

    get rootActivities(): ActivityCategoryDefinition[] {
        return this._rootActivities;
    }

    private _allActivities: ActivityCategoryDefinition[];

    get allActivities(): ActivityCategoryDefinition[] {
        return this._allActivities;
    }

    constructor(allActivities: ActivityCategoryDefinition[]) {
        this._allActivities = allActivities;
        this._rootActivities = this.buildActivityTree(allActivities);
    }

    private buildActivityTree(allActivities: ActivityCategoryDefinition[]): ActivityCategoryDefinition[] {
        /*
            Returns an array of root-level activities.  each root-level activity object will have its children property populatated, recursively.
        */
        for(let activity of allActivities){
            activity.removeChildren();
        }
        let rootActivities: ActivityCategoryDefinition[] = [];

        for (let activity of allActivities) {
            if (activity.parentTreeId.endsWith("TOP_LEVEL")) {
                activity.setFullPath("/"+activity.name+"/");
                rootActivities.push(activity)
            }
        }

        rootActivities.sort((a1,a2) => {
            if (a1.name > a2.name) {
                return 1;
            }
            if (a1.name < a2.name) {
                return -1;
            }
            return 0;
        });

        for (let rootActivity of rootActivities) {
            rootActivity = this.findChildActivities(rootActivity, allActivities);

        }
        return rootActivities;
    }

    findActivityByTreeId(treeId: string): ActivityCategoryDefinition{
        
        for(let activity of this._allActivities){
            // console.log(activity);
            if(activity.treeId == treeId){
                // console.log("returning activity ", activity);
                return activity;
            }
        }

        return null;
    }

    findActivityByIdentifier(identifier: string): ActivityCategoryDefinition{
        for(let activity of this._allActivities){
            if(activity.treeId == identifier){
                return activity;
            }
        }
        for(let activity of this._allActivities){
            if(activity.name == identifier){
                return activity;
            }
        }
        for(let activity of this._allActivities){
            if(activity.id == identifier){
                return activity;
            }
        }
    }

    activityNameIsUnique(checkActivity:ActivityCategoryDefinition):boolean {
        let namesCount: number = 0;
        for(let activity of this._allActivities){
            if(activity.name == checkActivity.name){
                namesCount++;
            }
        }
        if(namesCount == 1){
            return true;
        }else if(namesCount > 1){
            return false;
        }else{
            console.log("How could names count possibly be less than 1 ?")
            return false;
        }
    }

    findChildActivities(activityNode: ActivityCategoryDefinition, allActivities: ActivityCategoryDefinition[]): ActivityCategoryDefinition {
        for (let activity of allActivities) {
            if (activity.parentTreeId == activityNode.treeId) {
                activity.setFullPath(activityNode.fullNamePath + activity.name + "/");
                activityNode.addChild(activity);
            }
        }
        for (let childNode of activityNode.children) {
            childNode = this.findChildActivities(childNode, allActivities);
        }
        activityNode.children.sort((c1,c2) => {
            if (c1.name > c2.name) {
                return 1;
            }
            if (c1.name < c2.name) {
                return -1;
            }
            return 0;
        });
        return activityNode;
    }

    addActivityToTree(activity: ActivityCategoryDefinition) {
        this._allActivities.push(activity);
        this._rootActivities = this.buildActivityTree(this.allActivities);
    }

    pruneActivityFromTree(activityRemove: ActivityCategoryDefinition) {
        /*
            2018-12-13
            Warning: this method works but there is a flaw:  when you click delete on an activity that has children, only the clicked activity is deleted, and not its children
            what happens then is that the children still exist as objects in the database because they were not explicitly destroyed.  
            then every time all activities for a user are fetched, those parentless child activities are fetched but never displayed and are unusable and inaccessible.
            
            as a temporary solution, the front end prevents the deletion of any activity that has children - the delete button is only available if the activity has no children.

        */
        for(let activity of this._allActivities){
            if(activity.treeId == activityRemove.treeId){
                this._allActivities.splice(this._allActivities.indexOf(activity),1);
            }
        }

        this._rootActivities = this.buildActivityTree(this.allActivities);
    }

}