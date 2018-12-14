import { CategorizedActivity } from "./categorized-activity.model";

export class ActivityTree {
    /*
        The tree is strictly a model used by the front end and not something that has any data about it saved on the DB.
    */


    private _rootActivities: CategorizedActivity[];

    get rootActivities(): CategorizedActivity[] {
        return this._rootActivities;
    }

    private _allActivities: CategorizedActivity[];

    get allActivities(): CategorizedActivity[] {
        return this._allActivities;
    }

    constructor(allActivities: CategorizedActivity[]) {
        console.log("constructor: all activities", allActivities)
        this._allActivities = allActivities;
        this._rootActivities = this.buildActivityTree(allActivities);
    }

    private buildActivityTree(allActivities: CategorizedActivity[]): CategorizedActivity[] {
        /*
            Returns an array of root-level activities.  each root-level activity object will have its children property populatated, recursively.
        */
        for(let activity of allActivities){
            activity.removeChildren();
        }
        let rootActivities: CategorizedActivity[] = [];

        for (let activity of allActivities) {
            if (activity.parentTreeId.endsWith("TOP_LEVEL")) {
                rootActivities.push(activity)
            }
        }

        for (let rootActivity of rootActivities) {
            rootActivity = this.findChildActivities(rootActivity, allActivities);

        }
        return rootActivities;
    }

    findChildActivities(activityNode: CategorizedActivity, allActivities: CategorizedActivity[]): CategorizedActivity {
        for (let activity of allActivities) {
            if (activity.parentTreeId == activityNode.treeId) {
                activityNode.addChild(activity);
            }
        }
        for (let childNode of activityNode.children) {
            childNode = this.findChildActivities(childNode, allActivities);
        }
        return activityNode;
    }

    addActivityToTree(activity: CategorizedActivity) {
        console.log("adding", activity)
        this._allActivities.push(activity);
        this._rootActivities = this.buildActivityTree(this.allActivities);
    }

    pruneActivityFromTree(activityRemove: CategorizedActivity) {
        for(let activity of this._allActivities){
            if(activity.treeId == activityRemove.treeId){
                this._allActivities.splice(this._allActivities.indexOf(activity),1);
            }
        }

        this._rootActivities = this.buildActivityTree(this.allActivities);
    }

}