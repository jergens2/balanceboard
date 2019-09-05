import { ActivityCategoryDefinition } from "../../dashboard/activities/api/activity-category-definition.class";
import { ActivityTree } from "../../dashboard/activities/api/activity-tree.class";
import { Subject } from "rxjs";
import { ActivityCategoryDefinitionService } from "../../dashboard/activities/api/activity-category-definition.service";
import { Guid } from "../utilities/guid.class";
import { ActivityCategoryDefinitionHttpShape } from "../../dashboard/activities/api/activity-category-definition-http-shape.interface";
import { ActivityDurationSetting } from "../../dashboard/activities/api/activity-duration.enum";



export class ActivityInputSearch {

    private activitiesService: ActivityCategoryDefinitionService;
    constructor(activitiesService: ActivityCategoryDefinitionService) {
        this.activitiesService = activitiesService;
    }

    public searchForActivities(searchValue: string): ActivityCategoryDefinition[] {
        let searchResults: ActivityCategoryDefinition[] = [];
        if (searchValue.length === 1 && searchValue.charAt(0) === "/") {
            this.createNewActivity$.next();
            return this.activitiesService.activitiesTree.allActivitiesAndRoutines.sort((activity1, activity2) => {
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
                searchResults = [this.initiateCreationOfNewActivity(searchValue, null)];
            }
            else {
                let fullMatches: ActivityCategoryDefinition[] = this.findFullMatches(baseMatches, searchValue);
                if (fullMatches.length == 0) {
                    let parentActivity: ActivityCategoryDefinition = this.findParentActivity(baseMatches, searchValue);
                    searchResults = [this.initiateCreationOfNewActivity(searchValue, parentActivity)];
                } else if (fullMatches.length >= 1) {
                    this.createNewActivity$.next();
                    searchResults = fullMatches;
                }
            }
        }
        return searchResults;
    }


    private findbaseMatches(searchValue: string): ActivityCategoryDefinition[] {
        let matches: ActivityCategoryDefinition[] = [];
        let pathNames: string[] = searchValue.toLowerCase().split("/").filter((val) => {
            return val != "";
        });
        let rootSearchWord = pathNames[0];
        //I'm a slasher:  https://www.youtube.com/watch?v=wE0s31IODJA
        let isSlasher: boolean = searchValue.charAt(searchValue.length - 1) === "/";
        let moreThanOne: boolean = pathNames.length > 1;
        if (!moreThanOne && !isSlasher) {
            this.activitiesService.activitiesTree.allActivitiesAndRoutines.forEach((activity) => {
                if (activity.fullNamePathIndexOf(rootSearchWord) > -1) {
                    matches.push(activity);
                }
            });
        } else {
            this.activitiesService.activitiesTree.allActivitiesAndRoutines.forEach((activity) => {
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
        let pathNames: string[] = searchValue.toLowerCase().split("/").filter((val) => {
            return val != "";
        });
        let startName: string = pathNames[0];
        let fullMatches: ActivityCategoryDefinition[] = [];
        baseMatches.forEach((baseMatch: ActivityCategoryDefinition) => {
            let startIndex: number = baseMatch.fullNamePathIndexOf(startName);
            if (startIndex > -1) {
                let isFullMatch: boolean = true;
                for (let i = 0; i < pathNames.length; i++) {
                    if (startIndex < baseMatch.fullNamePathSplit.length) {
                        let checkIndex = baseMatch.fullNamePathSplit[startIndex].toLowerCase().indexOf(pathNames[i].toLowerCase());
                        if (checkIndex != 0) {
                            isFullMatch = false;
                        }
                    } else if (startIndex >= baseMatch.fullNamePathSplit.length) {
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
        let pathNames: string[] = searchValue.toLowerCase().split("/").filter((val) => {
            return val != "";
        });
        let shortestBaseMatch: ActivityCategoryDefinition;
        let sortByShortest = baseMatches.sort((match1, match2) => {
            if (match1.fullNamePath.length < match2.fullNamePath.length) {
                return -1;
            }
            if (match1.fullNamePath.length > match2.fullNamePath.length) {
                return 1;
            }
            return 0;

        });
        shortestBaseMatch = sortByShortest[0];
        let currentBaseMatch: ActivityCategoryDefinition = shortestBaseMatch;
        for (let i = 1; i < pathNames.length; i++) {
            let childMatchFound: boolean = false;
            currentBaseMatch.children.forEach((child) => {
                if (child.name.toLowerCase() === pathNames[i]) {
                    childMatchFound;
                    currentBaseMatch = child;
                }
            });
            if (!childMatchFound) {
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
        let returnActivity: ActivityCategoryDefinition = null;
        if (!parentActivity) {
            // Create new Root-level activity
            let parentActivityId: string = this.activitiesService.userId + "_TOP_LEVEL"
            if (pathNames.length == 1) {

                let activityHttpShape: ActivityCategoryDefinitionHttpShape = {
                    _id: "",
                    userId: this.activitiesService.userId,
                    treeId: this.activitiesService.userId + "_" + Guid.newGuid(),
                    parentTreeId: parentActivityId,
                    name: pathNames[0],
                    description: "New root level activity",
                    color: "#ffffff",
                    icon: "",
                    durationSetting: ActivityDurationSetting.VariableLength,
                    specifiedDurationMinutes: 0,
                    targets: [],
                    isConfigured: false,
                    scheduleConfiguration: null,
                    isRoutine: false,
                    routineMembersActivityIds: [],
                }
                let newActivity = new ActivityCategoryDefinition(activityHttpShape);
                newActivity.setFullPath("/" + pathNames[0] + "/");
                this.createNewActivity$.next([newActivity]);
                returnActivity = newActivity;
            } else if (pathNames.length > 1) {
                let newActivities: ActivityCategoryDefinition[] = [];
                let currentFullPath: string = "/";
                parentActivityId = this.activitiesService.userId + "_TOP_LEVEL";


                for (let i = 0; i < pathNames.length; i++) {
                    currentFullPath += pathNames[i] + "/";
                    let activityName: string = pathNames[i];
                    let newActivity: ActivityCategoryDefinition;
                    
                    if (i == 0) {
                        let firstTreeId = this.activitiesService.userId + "_" + Guid.newGuid();
                        let activityHttpShape: ActivityCategoryDefinitionHttpShape = {
                            _id: "",
                            userId: this.activitiesService.userId,
                            treeId: firstTreeId,
                            parentTreeId: parentActivityId,
                            name: pathNames[0],
                            description: "New root level activity",
                            color: "#ffffff",
                            icon: "",
                            durationSetting: ActivityDurationSetting.VariableLength,
                            specifiedDurationMinutes: 0,
                            targets: [],
                            isConfigured: false,
                            scheduleConfiguration: null,
                            isRoutine: false,
                            routineMembersActivityIds: [],
                        }
                        newActivity = new ActivityCategoryDefinition(activityHttpShape);
                        parentActivityId = firstTreeId;
                    } else if (i > 0) {
                        let parentName = pathNames[i - 1];
                        let description: string = "Child of " + parentName;
                        let newTreeId: string = this.activitiesService.userId + "_" + Guid.newGuid();
                        let activityHttpShape: ActivityCategoryDefinitionHttpShape = {
                            _id: "",
                            userId: this.activitiesService.userId,
                            treeId: newTreeId,
                            parentTreeId: parentActivityId,
                            name: activityName,
                            description: description,
                            color: "#ffffff",
                            icon: "",
                            durationSetting: ActivityDurationSetting.VariableLength,
                            specifiedDurationMinutes: 0,
                            targets: [],
                            isConfigured: false,
                            scheduleConfiguration: null,
                            isRoutine: false,
                            routineMembersActivityIds: [],
                        }
                        newActivity = new ActivityCategoryDefinition(activityHttpShape);
                        parentActivityId = newTreeId;
                    }
                    newActivity.setFullPath(currentFullPath);
                    returnActivity = newActivity;

                    newActivities.push(newActivity);
                }
                this.createNewActivity$.next(newActivities);

            }
        } else if (parentActivity) {
            returnActivity = parentActivity;
            if (pathNames.length < 2) {
                console.log("Bigly error")
                this.createNewActivity$.next(null);
            } else {
                let newActivities: ActivityCategoryDefinition[] = [];
                let currentPathIndex: number = -1;
                for (let i = pathNames.length - 1; i >= 0; i--) {
                    if (pathNames[i].toLowerCase() === parentActivity.name.toLowerCase()) {
                        if (currentPathIndex == -1) {
                            currentPathIndex = i + 1;
                        }
                    }
                }
                while (currentPathIndex < pathNames.length) {
                    let activityName: string = pathNames[currentPathIndex];
                    let parentName: string = pathNames[currentPathIndex - 1];
                    let parentId: string = "";
                    if (parentActivity.name.toLowerCase() == parentName.toLowerCase()) {
                        parentId = parentActivity.treeId;
                    }
                    let activityHttpShape: ActivityCategoryDefinitionHttpShape = {
                        _id: "",
                        userId: this.activitiesService.userId,
                        treeId: this.activitiesService.userId + "_" + Guid.newGuid(),
                        parentTreeId: parentId,
                        name: activityName,
                        description: "Child of " + parentName,
                        color: parentActivity.color,
                        icon: "",
                        durationSetting: ActivityDurationSetting.VariableLength,
                        specifiedDurationMinutes: 0,
                        targets: [],
                        isConfigured: false,
                        scheduleConfiguration: null,
                        isRoutine: false,
                        routineMembersActivityIds: [],
                    }
                    let newActivity = new ActivityCategoryDefinition(activityHttpShape);
                    newActivity.setFullPath(parentActivity.fullNamePath + activityName + "/");
                    newActivities.push(newActivity);
                    currentPathIndex++;
                }
                this.createNewActivity$.next(newActivities);
            }
        }
        return returnActivity;
    }

}