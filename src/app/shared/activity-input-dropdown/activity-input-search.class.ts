import { ActivityCategoryDefinition } from "../document-definitions/activity-category-definition/activity-category-definition.class";
import { ActivityTree } from "../document-definitions/activity-category-definition/activity-tree.class";
import { Subject } from "rxjs";



export class ActivityInputSearch {
    constructor() { }

    public searchForActivities(searchValue: string, activitiesTree: ActivityTree): ActivityCategoryDefinition[] {
        let searchResults: ActivityCategoryDefinition[] = [];
        let activityPathMatches: {
            activity: ActivityCategoryDefinition,
            fullPath: string,
            fullPathSplit: string[],
            firstMatchIndex: number,
        }[] = [];

        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });
        let isSplit: boolean = false;

        let indices: number[] = [];
        for(let i=0;i<searchValue.length-1;i++){
            if(searchValue.charAt(i) === "/"){
                if(i !== 0 && i !== searchValue.length-1){
                    indices.push(i);
                }
            }
        }
        if(indices.length >= 1){
            isSplit = true;
        }
        
        if (isSplit) {
            for (let activity of activitiesTree.allActivities) {
                let firstMatchIndex: number = -1;
                let fullPathSplit: string[] = activity.fullNamePath.toLowerCase().split("/").filter((val) => { return val != ""; });
                fullPathSplit.forEach((activityPath) => {
                    if (activityPath == pathNames[0]) {
                        firstMatchIndex = fullPathSplit.indexOf(activityPath);
                    }
                });
                if (firstMatchIndex > -1) {
                    activityPathMatches.push({
                        activity: activity,
                        fullPath: activity.fullNamePath,
                        fullPathSplit: fullPathSplit,
                        firstMatchIndex: firstMatchIndex,
                    });
                }
            }

            if (activityPathMatches.length > 0) {
                let filteredMatches = activityPathMatches.filter((apm) => { return (apm.fullPath).toLowerCase().indexOf(searchValue) > -1 });

                if (filteredMatches.length == 0) {
                    return this.initiateCreationOfNewActivity(pathNames, activityPathMatches[0].activity);
                } else {
                    return activityPathMatches.map((apm) => { return apm.activity });
                }
            } else {
                this.createNewActivity$.next(null);
                return [];
            }
        } else {
            for (let activity of activitiesTree.allActivities) {
                if (activity.fullNamePath.toLowerCase().indexOf(searchValue) > -1) {
                    searchResults.push(activity);
                }
            }
            this.createNewActivity$.next(null);
            return searchResults.sort((result1, result2) => {
                if (result1.fullNamePath < result2.fullNamePath) {
                    return -1;
                }
                if (result1.fullNamePath > result2.fullNamePath) {
                    return 1;
                }
                return 0;
            });;
        }
    }


    createNewActivity$: Subject<any> = new Subject();
    initiateCreationOfNewActivity(pathNames: string[], firstMatchActivity: ActivityCategoryDefinition): ActivityCategoryDefinition[] {    
        let name: string = ""; 
        if(pathNames.length == 2){
            name = pathNames[1];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let newActivity: ActivityCategoryDefinition = new ActivityCategoryDefinition("", "", "", name, "Child of "+firstMatchActivity.name, firstMatchActivity.treeId, firstMatchActivity.color);
            newActivity.setFullPath(firstMatchActivity.fullNamePath + newActivity.name + "/");
            this.createNewActivity$.next(newActivity);
            return [newActivity];
        }else{
            console.log("Warning.  Path names is not 2.  UNHANDLED");
            return null;
        }     
    }

}