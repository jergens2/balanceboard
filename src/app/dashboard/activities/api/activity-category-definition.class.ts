import { ActivityDurationSetting } from "./activity-duration.enum";
import { ActivityTargetConfiguration } from "./activity-target-configuration.interface";
import { ActivityCategoryDefinitionHttpShape } from "./activity-category-definition-http-shape.interface";
import { ScheduleConfiguration } from "../../../shared/utilities/schedule-configuration.interface";
import { ScheduleRepitition } from "../../../shared/utilities/schedule-repitition.interface";
import * as moment from 'moment';
import { TimeUnit } from "../../../shared/utilities/time-unit.enum";
import { ScheduleRepititionCalculator } from "../../../shared/utilities/schedule-repitition-calculator.class";

export class ActivityCategoryDefinition {

    private _httpShape: ActivityCategoryDefinitionHttpShape;
    public get httpShape(): ActivityCategoryDefinitionHttpShape{
        return this._httpShape;
    }

    public get id(): string{ return this._httpShape._id; }
    public set id(id: string){ this._httpShape._id = id; }

    public get treeId(): string{ return this._httpShape.treeId; }
    public set treeId(treeId: string){ this._httpShape.treeId = treeId; }
    
    public get name(): string{ return this._httpShape.name; }
    public set name(name: string){ this._httpShape.name = name; }

    public get description(): string { return this._httpShape.description; }
    public set description(description: string){ this._httpShape.description = description; }

    public get userId(): string { return this._httpShape.userId; }
    public set userId(userId: string){ this._httpShape.userId = userId; }

    public get parentTreeId(): string{ return this._httpShape.parentTreeId; }
    public set parentTreeId(parentTreeId: string){ this._httpShape.parentTreeId = parentTreeId; }

    public get durationSetting(): ActivityDurationSetting{ return this._httpShape.durationSetting; }
    public set durationSetting(durationSetting: ActivityDurationSetting){ this._httpShape.durationSetting = durationSetting; }

    public get specifiedDurationMinutes(): number { return this._httpShape.specifiedDurationMinutes; }
    public set specifiedDurationMinutes(minutes: number){ this._httpShape.specifiedDurationMinutes = minutes; }
    
    public get targets(): ActivityTargetConfiguration[] { return this._httpShape.targets; }
    public set targets(targets: ActivityTargetConfiguration[]){ this._httpShape.targets = targets; }
    
    public get color(): string { return this._httpShape.color; }
    public set color(color: string){ this._httpShape.color = color; }

    public get icon(): string{ return this._httpShape.icon; }
    public set icon(icon: string){ this._httpShape.icon = icon; }

    public get scheduleConfiguration(): ScheduleConfiguration{ return this._httpShape.scheduleConfiguration; }
    public set scheduleConfiguration(conf: ScheduleConfiguration){ this._httpShape.scheduleConfiguration = conf; }
    public isScheduledOnDate(dateYYYYMMDD: string): boolean{
        if(this.scheduleConfiguration != null){
            this.scheduleConfiguration.repititions.filter((repitition: ScheduleRepitition)=>{
                let dayAfterStart: boolean = moment(repitition.startsOnDateTimeISO).isBefore(moment(dateYYYYMMDD));
                return dayAfterStart;
            }).forEach((repitition: ScheduleRepitition)=>{
                if(ScheduleRepititionCalculator.repititionIsOnDay(repitition, dateYYYYMMDD)){
                    return true;
                }                
            });
            return false;
        }else{
            return false;
        }
    }

    public get isRoutine(): boolean{ return this._httpShape.isRoutine; }
    public set isRoutine(isRoutine: boolean){ this._httpShape.isRoutine = isRoutine; }

    public get routineMembersActivityIds(): string[] { return this._httpShape.routineMembersActivityIds; }
    public set routineMembersActivityIds(ids: string[]){ this._httpShape.routineMembersActivityIds = ids; }

    public get isConfigured(): boolean { return this._httpShape.isConfigured;   }
    // public set isConfigured(isConfigured: boolean) { this._httpShape.isConfigured = isConfigured };





    private _children: ActivityCategoryDefinition[] = [];
    private _fullNamePath: string = "/";

    constructor(httpShape: ActivityCategoryDefinitionHttpShape) {
        this._httpShape = httpShape;
        this._fullNamePath = "/" + this.name;
    }


    public setFullPath(fullPath: string) {
        this._fullNamePath = fullPath;
    }
    public get fullNamePath(): string {
        return this._fullNamePath;
    }
    public fullNamePathIndexOf(searchValue: string, preciseMatch?: boolean): number {
        /*
            This method returns the position in the path where the searchValue is found.
            for example, full path is:
            /first/second/third/
            /[0]/[1]/[2]
            and searchValue is: "second"
            then the return value would be 1
        */

        let foundIndex: number = -1;
        this.fullNamePathSplit.forEach((pathName: string) => {
            if(preciseMatch){
                if (pathName.toLowerCase().indexOf(searchValue) == 0 && pathName.length == searchValue.length) {
                    foundIndex = this.fullNamePathSplit.indexOf(pathName);
                }
            }else{
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