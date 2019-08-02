import { ActivityCategoryDefinition } from "../document-definitions/activity-category-definition/activity-category-definition.class";
import { ActivityTree } from "../document-definitions/activity-category-definition/activity-tree.class";
import { Subject } from "rxjs";



export class ActivityInputSearch {

    private activitiesTree: ActivityTree;
    constructor(activitiesTree: ActivityTree) {
        this.activitiesTree = activitiesTree;
    }

    public searchForActivities(searchValue: string): ActivityCategoryDefinition[] {
        let searchResults: ActivityCategoryDefinition[] = [];

        if (searchValue.length === 1 && searchValue.charAt(0) === "/") {
            this.createNewActivity$.next();
            return this.activitiesTree.allActivities.sort((activity1, activity2) => {
                if (activity1.fullNamePath < activity2.fullNamePath) {
                    return -1;
                }
                if (activity1.fullNamePath > activity2.fullNamePath) {
                    return 1;
                }
                return 0;
            });
        } else {
            let baseMatches: ActivityCategoryDefinition[] = this.findbaseMatches(searchValue);
            if (baseMatches.length == 0) {
                console.log(" No base matches, so making a root-level activity");
                this.initiateCreationOfNewActivity(searchValue, null);
                searchResults = [];
            }
            else {
                // console.log(" Yes base matches, so returning or finding parent if 0.  Base matches are:")
                // baseMatches.forEach((bm)=>{ console.log("  - " + bm.fullNamePath)})
                let fullMatches: ActivityCategoryDefinition[] = this.findFullMatches(baseMatches, searchValue);
                if (fullMatches.length == 0) {
                    // console.log("There were no full matches, so we're gonna find the parent and create new.");
                    let parentActivity: ActivityCategoryDefinition = this.findParentActivity(baseMatches, searchValue);
                    this.initiateCreationOfNewActivity(searchValue, parentActivity)
                } else if (fullMatches.length >= 1) {
                    // console.log("There was one full match");
                    this.createNewActivity$.next();
                    searchResults = fullMatches;
                } 
                // else if (fullMatches.length > 1) {
                //     // console.log("There were more than 1 full match");
                //     searchResults = fullMatches;
                // }

            }
        }

        return searchResults;
    }


    private findbaseMatches(searchValue: string): ActivityCategoryDefinition[] {
        let matches: ActivityCategoryDefinition[] = [];
        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });
        let rootSearchWord = pathNames[0];
        //I'm a slasher:  https://www.youtube.com/watch?v=wE0s31IODJA
        let isSlasher: boolean = searchValue.charAt(searchValue.length-1) === "/";
        let moreThanOne: boolean = pathNames.length > 1;
        if(!moreThanOne && !isSlasher){
            this.activitiesTree.allActivities.forEach((activity) => {
                if (activity.fullNamePathIndexOf(rootSearchWord) > -1) {
                    matches.push(activity);
                }
            });
        }else{
            this.activitiesTree.allActivities.forEach((activity) => {
                if (activity.fullNamePathIndexOf(rootSearchWord, true) > -1) {
                    matches.push(activity);
                }
            });
        }
        return matches;
    }
    private findFullMatches(baseMatches: ActivityCategoryDefinition[], searchValue: string): ActivityCategoryDefinition[] {
        /*
            This method checks to see if the searchValue fully matches any results.
            e.g. if there is a result of /balanceboard/new
            then searchValue of /balanceboard/new/ returns with value
            and  searchValue of /balanceboard/nex/ returns empty array
        */
        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });
        let startName: string = pathNames[0];
        let fullMatches: ActivityCategoryDefinition[] = [];
        baseMatches.forEach((baseMatch: ActivityCategoryDefinition) => {
            let startIndex: number = baseMatch.fullNamePathIndexOf(startName);
            if(startIndex > -1){
                let isFullMatch: boolean = true;
                for (let i = 0; i < pathNames.length; i++) {
                    if(startIndex < baseMatch.fullNamePathSplit.length){
                        let checkIndex = baseMatch.fullNamePathSplit[startIndex].toLowerCase().indexOf(pathNames[i].toLowerCase());
                        if (checkIndex != 0) {
                            isFullMatch = false;
                        }
                    }else if(startIndex >= baseMatch.fullNamePathSplit.length){
                        isFullMatch = false;
                    }                    
                    startIndex++;
                }
                if (isFullMatch) {
                    fullMatches.push(baseMatch);
                }
            }
        });
        return fullMatches;
    }
    private findParentActivity(baseMatches: ActivityCategoryDefinition[], searchValue): ActivityCategoryDefinition {
        /*
            This method is fired if there was at least 1 baseMatch found earlier, but when no precise matches.
            e.g., searchValue = "/exists/new/subnew/subnew" will return activity 'exists' 
        */
        let foundParent: ActivityCategoryDefinition = null;
        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });
        let shortestBaseMatch: ActivityCategoryDefinition;
        let sortByShortest = baseMatches.sort((match1, match2)=>{
            if(match1.fullNamePath.length < match2.fullNamePath.length){
                return -1;
            }
            if(match1.fullNamePath.length > match2.fullNamePath.length){
                return 1;
            }
            return 0;
            
        });
        shortestBaseMatch = sortByShortest[0];
        let currentBaseMatch: ActivityCategoryDefinition = shortestBaseMatch;
        for(let i=1;i<pathNames.length; i++){
            let childMatchFound: boolean = false;
            currentBaseMatch.children.forEach((child)=>{
                if(child.name.toLowerCase() === pathNames[i]){
                    childMatchFound;
                    currentBaseMatch = child;
                }
            });
            if(!childMatchFound){
                foundParent = currentBaseMatch;
            }
        }
        return foundParent;
    }


    createNewActivity$: Subject<ActivityCategoryDefinition[]> = new Subject();
    initiateCreationOfNewActivity(searchValue: string, parentActivity?: ActivityCategoryDefinition): ActivityCategoryDefinition {


        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });

        if (!parentActivity) {
            // Create new Root-level activity
            if(pathNames.length == 1){
                let newActivity: ActivityCategoryDefinition = new ActivityCategoryDefinition("", "", "", pathNames[0], "Root level activity", "", "#ffffff");
                newActivity.setFullPath("/" + name + "/");
                this.createNewActivity$.next([newActivity]); 
            }else if(pathNames.length > 1){
                let newActivities: ActivityCategoryDefinition[] = [];
                let currentFullPath: string = "/";
                for(let i=0;i<pathNames.length; i++){
                    currentFullPath += pathNames[i] + "/";
                    let activityName: string = pathNames[i];
                    let newActivity: ActivityCategoryDefinition;
                    if(i == 0){
                        newActivity = new ActivityCategoryDefinition("", "", "", activityName, "New root level activity", "", "#ffffff");
                    }else if(i > 0){
                        let parentName = pathNames[i-1];
                        newActivity = new ActivityCategoryDefinition("", "", "", activityName, "Child of "+ parentName, "", "#ffffff");
                    }
                    newActivity.setFullPath(currentFullPath);
                    newActivities.push(newActivity);
                }
                this.createNewActivity$.next(newActivities);
            }
            return null;
        } else if (parentActivity) {
            if(pathNames.length < 2){
                console.log("errororkorkeokroekreokreork")
            }



            console.log("Warning: incomplete. Its not a root activity, its a child of " + parentActivity.name);
            this.createNewActivity$.next();
            return parentActivity;
        }
    }

}