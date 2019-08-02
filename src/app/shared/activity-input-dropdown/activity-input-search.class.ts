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

        if(searchValue.length === 1 && searchValue.charAt(0) === "/"){
            return this.activitiesTree.allActivities.sort((activity1, activity2)=>{
                if(activity1.fullNamePath < activity2.fullNamePath){
                    return -1;
                }
                if(activity1.fullNamePath > activity2.fullNamePath){
                    return 1;
                }
                return 0;
            });
        }else{
            let baseMatches: ActivityCategoryDefinition[] = this.findbaseMatches(searchValue);
            if(baseMatches.length == 0){
                this.initiateCreationOfNewActivity(searchValue, null)
            }
            else{
                let fullMatches: ActivityCategoryDefinition[] = this.findFullMatches(baseMatches, searchValue);
                if(fullMatches.length == 0){
                    console.log("There were no full matches, so we're gonna find the parent and create new.");
                    // let parentActivity: ActivityCategoryDefinition = this.findParentActivity(baseMatches, searchValue);
                    // this.initiateCreationOfNewActivity(searchValue, parentActivity)
                }else if(fullMatches.length == 1){
                    console.log("There was one full match");
                    searchResults = fullMatches;
                }else if(fullMatches.length > 1){
                    console.log("There were more than 1 full match");
                    searchResults = fullMatches;
                }
                
            }           
        }   

        return searchResults;   
    }


    private findbaseMatches(searchValue: string): ActivityCategoryDefinition[]{
        let matches: ActivityCategoryDefinition[] = [];
        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });
        let rootSearchWord = pathNames[0];
        this.activitiesTree.allActivities.forEach((activity)=>{
            let index: number = activity.fullNamePathIndexOf(rootSearchWord);
            if(activity.fullNamePathIndexOf(rootSearchWord) > -1){
                matches.push(activity);
            }
        });
        return matches;
    }
    private findFullMatches(baseMatches: ActivityCategoryDefinition[], searchValue: string): ActivityCategoryDefinition[]{
        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });
        let startName: string = pathNames[0];
        let fullMatches: ActivityCategoryDefinition[] = [];
        baseMatches.forEach((baseMatch: ActivityCategoryDefinition)=>{
            let startIndex: number = baseMatch.fullNamePathIndexOf(startName);
            let isFullMatch: boolean = true;
            for(let i=0; i<pathNames.length; i++){
                let checkIndex = baseMatch.fullNamePathSplit[startIndex].toLowerCase().indexOf(pathNames[i].toLowerCase());
                console.log("Check index is " + checkIndex);
                if(checkIndex != 0){
                    isFullMatch = false;
                }
                startIndex++;
            }
            if(isFullMatch){
                fullMatches.push(baseMatch);
            }
        });
        return fullMatches;
    }
    private findParentActivity(baseMatches: ActivityCategoryDefinition[], searchValue): ActivityCategoryDefinition{
        let refinedMatches: ActivityCategoryDefinition[] = baseMatches;
        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });
        let startName: string = pathNames[0];
        let pathIndex: number = 0;


        console.log(" * * *Start loop ")
        while(refinedMatches.length > 1){
            let newMatches: ActivityCategoryDefinition[] = [];
            refinedMatches.forEach((baseMatch: ActivityCategoryDefinition)=>{
                let startIndex: number = baseMatch.fullNamePathIndexOf(startName);
                
                for(let i=0; i<pathNames.length; i++){
                    if(baseMatch.fullNamePathSplit[startIndex].toLowerCase() == pathNames[i].toLowerCase()){
                        refinedMatches.push(baseMatch);
                    }
                }

            });

            refinedMatches = newMatches;
            console.log("Refined matches.length: " + refinedMatches.length);
        }
        console.log(" * * *END of loop ")


        
        return null;
    }


    createNewActivity$: Subject<any> = new Subject();
    initiateCreationOfNewActivity(searchValue: string, parentActivity?: ActivityCategoryDefinition): ActivityCategoryDefinition[] {
        let pathNames: string[] = searchValue.split("/").filter((val) => {
            return val != "";
        });
        let newActivity: ActivityCategoryDefinition;
        if(!parentActivity){
            console.log("This is a root level activity");
            // Create new Root-level activity
            newActivity = new ActivityCategoryDefinition("", "", "", pathNames[0], "Root level activity", "", "#ffffff");
            newActivity.setFullPath("/"+name+"/");
            this.createNewActivity$.next(newActivity);
            return [newActivity];
        }else if(parentActivity){
            // Create new activity, child of another
            console.log(" Its not a root activity, its a child of " + parentActivity.name);
            this.createNewActivity$.next();
            return [];
        }





        // let parentStartIndex: number = 0;




        // let newActivityName: string = pathNames[pathNames.length-1];
        
        // if (pathNames.length == 2) {
        //     // name = name.charAt(0).toUpperCase() + name.slice(1);
        //     newActivity = new ActivityCategoryDefinition("", "", "", newActivityName, "Child of " + parentActivity.name, parentActivity.treeId, parentActivity.color);
        //     newActivity.setFullPath(parentActivity.fullNamePath + newActivity.name + "/");
        //     this.createNewActivity$.next(newActivity);
        //     return [newActivity];
        // } else if(pathNames.length > 2){
        //     let activityPathNames: string[] = parentActivity.fullNamePath.toLowerCase().split("/");

        //     if(pathNames[pathNames.length-2].toLowerCase() !== parentActivity.name.toLowerCase()){
        //         console.log(" ** this is NOT an immediate child of " + parentActivity.name + " , but is a descendent" )
        //         let parentMatchFound: boolean = false;
        //         let pathNamesIndex: number = pathNames.length-1;
        //         while(!parentMatchFound && pathNamesIndex >= 0){
        //             if(parentActivity.name.toLowerCase() === pathNames[pathNamesIndex]){
        //                 parentMatchFound = true;
        //                 // console.log("it was found at index: " + pathNamesIndex + " : " + pathNames[pathNamesIndex]);
        //             }
        //             pathNamesIndex --;
        //         }
        //         if(parentMatchFound){
        //             let matchFound: boolean = false;
        //             let directParentActivity: ActivityCategoryDefinition;
        //             function findDirectParent(activity: ActivityCategoryDefinition, pathNames: string[], currentIndex: number): ActivityCategoryDefinition{
        //                 let foundActivity: ActivityCategoryDefinition;
        //                 activity.children.forEach((child)=>{
        //                     if(child.name.toLowerCase() === newActivityName){
        //                         return child;
        //                     }
        //                 })
        //                 return null;
        //             }
        //             directParentActivity = findDirectParent(parentActivity, pathNames, pathNamesIndex);
        //             if(directParentActivity){
        //                 // console.log("Parent found: " + directParentActivity.fullNamePath)
        //             }else{
        //                 // console.log("Parent not found. " + pathNames[pathNamesIndex]);
        //             }

        //         }else{
        //             console.log("Error: There was no match");
        //         }
        //         newActivity = new ActivityCategoryDefinition("", "", "", name, "Child of " + parentActivity.name, parentActivity.treeId, parentActivity.color);
        //         newActivity.setFullPath(parentActivity.fullNamePath + newActivity.name + "/");
        //     }else{
        //         console.log(" ** this is a child of " + parentActivity.name)
        //         newActivity = new ActivityCategoryDefinition("", "", "", name, "Child of " + parentActivity.name, parentActivity.treeId, parentActivity.color);
        //         newActivity.setFullPath(parentActivity.fullNamePath + newActivity.name + "/");
        //     }
            
        //     this.createNewActivity$.next(newActivity);
        //     return [newActivity];
        // }else{
        //     console.log("Error with pathnames: " , pathNames);
        // }
    }

}