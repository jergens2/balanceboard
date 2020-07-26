import { ActivityDurationSetting } from "./activity-duration.enum";
import { ActivityCategoryDefinitionHttpShape } from "./activity-category-definition-http-shape.interface";
import { ActivityPointsConfiguration } from "./activity-points-configuration.interface";
import { ActivityScheduleRepitition } from "./activity-schedule-repitition.interface";

export class ActivityCategoryDefinition {

    constructor(httpShape: ActivityCategoryDefinitionHttpShape) {
        this._httpShape = httpShape;
        this._fullNamePath = "/" + this.name;
        if(this.parentTreeId === this.userId + "_TOP_LEVEL"){
            this._isRootLevel = true;
        }
    }

    private _httpShape: ActivityCategoryDefinitionHttpShape;
    private _isRootLevel: boolean = false;

    public get httpShape(): ActivityCategoryDefinitionHttpShape { return this._httpShape; }
    public get id(): string { return this._httpShape._id; }
    public get treeId(): string { return this._httpShape.treeId; }
    public get isInTrash(): boolean { return this._httpShape.isInTrash }
    public get name(): string { return this._httpShape.name; }
    public get description(): string { return this._httpShape.description; }
    public get userId(): string { return this._httpShape.userId; }
    public get parentTreeId(): string { return this._httpShape.parentTreeId; }
    public get durationSetting(): ActivityDurationSetting { return this._httpShape.durationSetting; }
    public get specifiedDurationMinutes(): number { return this._httpShape.specifiedDurationMinutes; }
    public get scheduleRepititions(): ActivityScheduleRepitition[] { return this._httpShape.scheduleRepititions; }
    public get currentPointsConfiguration(): ActivityPointsConfiguration { return this._httpShape.currentPointsConfiguration; }
    public get pointsConfigurationHistory(): ActivityPointsConfiguration[] { return this._httpShape.pointsConfigurationHistory; }
    public get color(): string { return this._httpShape.color; }
    public get icon(): string { return this._httpShape.icon; }
    public get isSleepActivity(): boolean { return this._httpShape.isSleepActivity; }
    public get canDelete(): boolean { return this._httpShape.canDelete; }
    public get isRootLevel(): boolean { return this._isRootLevel; }

    public set id(id: string) { this._httpShape._id = id; }
    public set treeId(treeId: string) { this._httpShape.treeId = treeId; }
    public set name(name: string) { this._httpShape.name = name; }
    public set description(description: string) { this._httpShape.description = description; }
    public set userId(userId: string) { this._httpShape.userId = userId; }
    public set parentTreeId(parentTreeId: string) { this._httpShape.parentTreeId = parentTreeId; }
    public set durationSetting(durationSetting: ActivityDurationSetting) { this._httpShape.durationSetting = durationSetting; }
    public set specifiedDurationMinutes(minutes: number) { this._httpShape.specifiedDurationMinutes = minutes; }
    public set scheduleRepititions(scheduleRepititions: ActivityScheduleRepitition[]) { this._httpShape.scheduleRepititions = scheduleRepititions; }
    public set currentPointsConfiguration(pointsConfiguration: ActivityPointsConfiguration) { this._httpShape.currentPointsConfiguration = pointsConfiguration; }
    public set pointsConfigurationHistory(pointsConfigurations: ActivityPointsConfiguration[]) { this._httpShape.pointsConfigurationHistory = pointsConfigurations; }
    public set color(color: string) { this._httpShape.color = color; }
    public set icon(icon: string) { this._httpShape.icon = icon; }
    public set isSleepActivity(isSleep: boolean) { this._httpShape.isSleepActivity = isSleep; }
    public set canDelete(canDelete: boolean) { this._httpShape.canDelete = canDelete; }

    public isScheduledOnDate(dateYYYYMMDD: string): boolean {

        // console.log("This method is disabled.");
        return false;
    }
    public moveToTrash() { this._httpShape.isInTrash = true; }
    public removeFromTrash() { this._httpShape.isInTrash = false; }

    public get isRoutine(): boolean { return this._httpShape.isRoutine; }
    public set isRoutine(isRoutine: boolean) { this._httpShape.isRoutine = isRoutine; }

    public get routineMembersActivityIds(): string[] { return this._httpShape.routineMembersActivityIds; }
    public set routineMembersActivityIds(ids: string[]) { this._httpShape.routineMembersActivityIds = ids; }

    public get isConfigured(): boolean { return this._httpShape.isConfigured; }
    // public set isConfigured(isConfigured: boolean) { this._httpShape.isConfigured = isConfigured };

    private _children: ActivityCategoryDefinition[] = [];
    private _fullNamePath: string = "/";




    public setFullPath(fullPath: string) {this._fullNamePath = fullPath;}
    public get fullNamePath(): string {return this._fullNamePath;}

    /**
    * This method returns the position in the path where the searchValue is found.
    * for example, full path is:
    * /first/second/third/
    * /[0]/[1]/[2]
    * and searchValue is: "second"
    * then the return value would be 1
    */
    public fullNamePathIndexOf(searchValue: string, preciseMatch?: boolean): number {


        let foundIndex: number = -1;
        this.fullNamePathSplit.forEach((pathName: string) => {
            if (preciseMatch) {
                if (pathName.toLowerCase().indexOf(searchValue) == 0 && pathName.length == searchValue.length) {
                    foundIndex = this.fullNamePathSplit.indexOf(pathName);
                }
            } else {
                if (pathName.toLowerCase().indexOf(searchValue) == 0) {
                    foundIndex = this.fullNamePathSplit.indexOf(pathName);
                }
            }
        });
        return foundIndex;
    }
    public get fullNamePathSplit(): string[] {
        return this.fullNamePath.split("/").filter((path) => { return path != ""; });
    }

    // public findDescendant(descendantName: string): ActivityCategoryDefinition{
    //     if(this.name.toLowerCase() == descendantName.toLowerCase()){
    //         return this;
    //     }else{
    //         if(this.children.length > 0){
    //             this.children.forEach((child)=>{
    //                 return child.findDescendant(descendantName);
    //             })
    //         }else{
    //             return null;
    //         }
    //     }
    // }



    public get children(): ActivityCategoryDefinition[] {
        return this._children;
    }
    // set children(children: CategorizedActivity[]) {
    //     this._children = children;
    // }

    /**
     * Gets all child tree ids, recursively.
     * 
     */
    public getAllChildActivities(): string[] { 
        let childIds: string[] = [];
        if(this.children.length > 0){
            this.children.forEach(child => { 
                childIds.push(child.treeId);
                childIds = [...childIds, ...child.getAllChildActivities()];
            });
        }
        return childIds;
    }

    addChild(childCategory: ActivityCategoryDefinition) {
        this._children.push(childCategory);
    }
    removeChildren() {
        this._children = [];
    }
    removeChild(childCategory: ActivityCategoryDefinition) {
        if (this._children.length > 0) {
            if (this._children.indexOf(childCategory) > -1) {
                this._children.splice(this._children.indexOf(childCategory), 1);
                return;
            } else {
                for (let child of this._children) {
                    if (child.children.length > 0) {
                        child.removeChild(childCategory);
                    }
                }
            }
        } else {
            return;
        }
        return;
    }

}