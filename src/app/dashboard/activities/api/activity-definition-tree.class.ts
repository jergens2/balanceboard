import { ActivityCategoryDefinition } from './activity-category-definition.class';
import { DaybookDayItemScheduledActivityItem } from '../../daybook/daybook-day-item/data-items/daybook-day-item-scheduled-activity.class';
import { BehaviorSubject, Observable } from 'rxjs';

export class ActivityDefinitionTree {
    constructor(allActivities: ActivityCategoryDefinition[]) {
        this._allActivitiesAndRoutines = allActivities;
        this._buildActivityTree(allActivities);
    }

    private _rootActivities: ActivityCategoryDefinition[];
    private _activityRoutines: ActivityCategoryDefinition[] = [];
    private _allActivitiesAndRoutines: ActivityCategoryDefinition[];
    private _scheduleConfiguredActivities$: BehaviorSubject<ActivityCategoryDefinition[]> = new BehaviorSubject([]);

    public get rootActivities(): ActivityCategoryDefinition[] { return this._rootActivities; }
    public get sleepActivity(): ActivityCategoryDefinition {
        return this._allActivitiesAndRoutines.find(activity => activity.isSleepActivity);
    }
    public get allActivities(): ActivityCategoryDefinition[] {
        return this._allActivitiesAndRoutines.filter(activity => (!activity.isRoutine));
    }
    public get allActivitiesAndRoutines(): ActivityCategoryDefinition[] { return this._allActivitiesAndRoutines; }
    public get activityRoutines(): ActivityCategoryDefinition[] { return this._activityRoutines; }
    public get allExcludingTrashed(): ActivityCategoryDefinition[] {
        return this._allActivitiesAndRoutines.filter(item => !item.isInTrash);
    }
    public get allTrashed(): ActivityCategoryDefinition[] { return this._allActivitiesAndRoutines.filter(item => item.isInTrash); }
    public get scheduleConfigurationActivities(): ActivityCategoryDefinition[] { return this._scheduleConfiguredActivities$.getValue(); }
    public get scheduleConfigurationActivities$(): Observable<ActivityCategoryDefinition[]> {
        return this._scheduleConfiguredActivities$.asObservable();
    }

    public findActivityByTreeId(treeId: string): ActivityCategoryDefinition {
        // console.log("looking for activity by tree id: ", treeId);
        for (const activity of this._allActivitiesAndRoutines) {
            // console.log(activity);
            if (activity.treeId === treeId) {
                // console.log("returning activity ", activity);
                return activity;
            }
        }
        return null;
    }

    public activityNameIsUnique(checkActivity: ActivityCategoryDefinition): boolean {
        let namesCount: number = 0;
        for (const activity of this._allActivitiesAndRoutines) {
            if (activity.name === checkActivity.name) {
                namesCount++;
            }
        }
        if (namesCount === 1) {
            return true;
        } else if (namesCount > 1) {
            return false;
        } else {
            console.log('How could names count possibly be less than 1 ?')
            return false;
        }
    }

    private _findChildActivities(activityNode: ActivityCategoryDefinition, 
        allActivities: ActivityCategoryDefinition[]): ActivityCategoryDefinition {
        for (const activity of allActivities) {
            if (activity.parentTreeId === activityNode.treeId) {
                activity.setFullPath(activityNode.fullNamePath + activity.name + '/');
                activityNode.addChild(activity);
            }
        }
        for (let childNode of activityNode.children) {
            childNode = this._findChildActivities(childNode, allActivities);
        }
        activityNode.children.sort((c1, c2) => {
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


    public addActivityToTree(activity: ActivityCategoryDefinition) {
        this._allActivitiesAndRoutines.push(activity);
        this._buildActivityTree(this.allActivitiesAndRoutines);
    }

    public pruneActivityFromTree(activityRemove: ActivityCategoryDefinition) {
        for (const activity of this._allActivitiesAndRoutines) {
            if (activity.treeId === activityRemove.treeId) {
                this._allActivitiesAndRoutines.splice(this._allActivitiesAndRoutines.indexOf(activity), 1);
            }
        }
        this._buildActivityTree(this.allActivitiesAndRoutines);
    }

    private _buildActivityTree(allActivities: ActivityCategoryDefinition[]) {
        /*
            Returns an array of root-level activities.
            each root-level activity object will have its children property populatated, recursively.
        */
    //    console.log("all Activities: " , allActivities)
        for (const activity of allActivities) {
            activity.removeChildren();
        }
        let rootActivities: ActivityCategoryDefinition[] = [];
        for (const activity of allActivities) {
            if (activity.parentTreeId.endsWith('_TOP_LEVEL')) {
                activity.setFullPath('/' + activity.name + '/');
                rootActivities.push(activity);
            }
        }
        rootActivities = rootActivities.sort((a1, a2) => {
            if (a1.name > a2.name) { return 1; }
            if (a1.name < a2.name) { return -1; }
            return 0;
        });

        for (let rootActivity of rootActivities) {
            rootActivity = this._findChildActivities(rootActivity, allActivities);
        }
        // console.log("Root activities: ", rootActivities);
        this._rootActivities = rootActivities;
        this._activityRoutines = rootActivities.filter((activity) => activity.isRoutine === true);
        this._scheduleConfiguredActivities$.next(allActivities.filter((item) => item.scheduleRepititions.length > 0));
    }


    private _buildScheduledActivityItem(activity: ActivityCategoryDefinition): DaybookDayItemScheduledActivityItem {
        const routineMemberActivities: DaybookDayItemScheduledActivityItem[] = [];
        if (activity.isRoutine) {
            console.log('Building a routine.  it might be tricky');
            activity.routineMembersActivityIds.forEach((treeId) => {
                const routineMemberActivity = this.findActivityByTreeId(treeId);
                if (routineMemberActivity) {
                    routineMemberActivities.push(this._buildScheduledActivityItem(routineMemberActivity));
                }
            })
        }
        const targetMinutes: number = -1;
        // console.log("Not implemented:  Determine the corrent target minutes from activity profile.  currently disabled.")
        const activityItem: DaybookDayItemScheduledActivityItem = {
            activityTreeId: activity.treeId,
            isComplete: false,
            targetMinutes: targetMinutes,
            timeMarkedCompleteISO: '',
            routineMemberActivities: routineMemberActivities,
        };
        return activityItem;
    }

}
