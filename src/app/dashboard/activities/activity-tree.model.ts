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

    findActivityById(treeId: string): CategorizedActivity{
        for(let activity of this._allActivities){
            if(activity.treeId == treeId){
                return activity;
            }
        }
        return null;
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

    addActivityToTree(activity: CategorizedActivity) {
        this._allActivities.push(activity);
        this._rootActivities = this.buildActivityTree(this.allActivities);
    }

    pruneActivityFromTree(activityRemove: CategorizedActivity) {
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