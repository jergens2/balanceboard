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
        for (let i = 0; i < searchValue.length - 1; i++) {
            if (searchValue.charAt(i) === "/") {
                if (i !== 0 && i !== searchValue.length - 1) {
                    indices.push(i);
                }
            }
        }
        if (indices.length >= 1) {
            isSplit = true;
        }
        if (isSplit) {
            for (let activity of activitiesTree.allActivities) {
                let fullPathSplit: string[] = activity.fullNamePath.toLowerCase().split("/").filter((val) => { return val != ""; });
                let firstMatchIndex: number = -1;
                if (activity.fullNamePath.toLowerCase().indexOf(searchValue) > -1) {
                    fullPathSplit.forEach((activityPath) => {
                        if (activityPath == pathNames[0]) {
                            firstMatchIndex = fullPathSplit.indexOf(activityPath);
                        }
                    })
                    if (firstMatchIndex > -1) {
                        activityPathMatches.push({
                            activity: activity,
                            fullPath: activity.fullNamePath,
                            fullPathSplit: fullPathSplit,
                            firstMatchIndex: firstMatchIndex,
                        });
                    }
                }
            }
            if (activityPathMatches.length == 0) {
                for (let activity of activitiesTree.allActivities) {
                    let fullPathSplit: string[] = activity.fullNamePath.toLowerCase().split("/").filter((val) => { return val != ""; });
                    let firstMatchIndex: number = -1;
                    fullPathSplit.forEach((activityPath) => {
                        if (activityPath == pathNames[0]) {
                            firstMatchIndex = fullPathSplit.indexOf(activityPath);
                        }
                    })
                    if (firstMatchIndex > -1) {
                        activityPathMatches.push({
                            activity: activity,
                            fullPath: activity.fullNamePath,
                            fullPathSplit: fullPathSplit,
                            firstMatchIndex: firstMatchIndex,
                        });
                    }
                }
            }
            if (activityPathMatches.length > 0) {
                let filteredMatches = activityPathMatches.filter((apm) => { return (apm.fullPath).toLowerCase().indexOf(searchValue) > -1 });
                if (filteredMatches.length == 0) {
                    return this.initiateCreationOfNewActivity(pathNames, activityPathMatches[0].activity);
                } else {
                    searchResults = activityPathMatches.map((apm) => { return apm.activity });
                }
            } else {
                searchResults = [];
            }
        } else {
            for (let activity of activitiesTree.allActivities) {
                if (activity.fullNamePath.toLowerCase().indexOf(searchValue) > -1) {
                    searchResults.push(activity);
                }
            }
            searchResults = searchResults.sort((result1, result2) => {
                if (result1.fullNamePath < result2.fullNamePath) {
                    return -1;
                }
                if (result1.fullNamePath > result2.fullNamePath) {
                    return 1;
                }
                return 0;
            });;
        }
        this.createNewActivity$.next(null);
        return searchResults
    }


    createNewActivity$: Subject<any> = new Subject();
    initiateCreationOfNewActivity(pathNames: string[], parentActivity: ActivityCategoryDefinition): ActivityCategoryDefinition[] {
        let name: string = "";
        let newActivity: ActivityCategoryDefinition
        if (pathNames.length == 2) {
            name = pathNames[1];
            // name = name.charAt(0).toUpperCase() + name.slice(1);
            newActivity = new ActivityCategoryDefinition("", "", "", name, "Child of " + parentActivity.name, parentActivity.treeId, parentActivity.color);
            newActivity.setFullPath(parentActivity.fullNamePath + newActivity.name + "/");
            this.createNewActivity$.next(newActivity);
            return [newActivity];
        } else if(pathNames.length > 2){
            let activityPathNames: string[] = parentActivity.fullNamePath.toLowerCase().split("/");

            if(pathNames[pathNames.length-2].toLowerCase() !== parentActivity.name.toLowerCase()){
                console.log("this is NOT a child of " + parentActivity.name )
                let parentMatchFound: boolean = false;
                let pathNamesIndex: number = pathNames.length-1;
                while(!parentMatchFound && pathNamesIndex >= 0){
                    if(parentActivity.name.toLowerCase() === pathNames[pathNamesIndex]){
                        parentMatchFound = true;
                        console.log("it was found at index: " + pathNamesIndex + " : " + pathNames[pathNamesIndex]);
                    }
                    pathNamesIndex --;
                }
                if(parentMatchFound){
                    let matchFound: boolean = false;
                    let directParentActivity: ActivityCategoryDefinition;
                    function findDirectParent(activity: ActivityCategoryDefinition, pathNames: string[], currentIndex: number): ActivityCategoryDefinition{
                        let foundActivity: ActivityCategoryDefinition;
                        activity.children.forEach((child)=>{
                            if(child.name.toLowerCase() === name){
                                return child;
                            }
                        })
                        return null;
                    }
                    directParentActivity = findDirectParent(parentActivity, pathNames, pathNamesIndex);
                    if(directParentActivity){
                        console.log("Parent found: " + directParentActivity.fullNamePath)
                    }else{
                        console.log("Parent not found. " + pathNames[pathNamesIndex]);
                    }

                }else{
                    console.log("Error: There was no match");
                }
                

                newActivity = new ActivityCategoryDefinition("", "", "", name, "Child of " + parentActivity.name, parentActivity.treeId, parentActivity.color);
                newActivity.setFullPath(parentActivity.fullNamePath + newActivity.name + "/");
            }else{
                console.log("this is a child of " + parentActivity.name)
                newActivity = new ActivityCategoryDefinition("", "", "", name, "Child of " + parentActivity.name, parentActivity.treeId, parentActivity.color);
                newActivity.setFullPath(parentActivity.fullNamePath + newActivity.name + "/");
            }
            
            this.createNewActivity$.next(newActivity);
            return [newActivity];
        }else{
            console.log("Error with pathnames: " , pathNames);
        }
    }

}