import { DayStructureDataItem } from "../../../../api/data-items/day-structure-data-item.interface";
import { DayStructureSleepCycle } from "../../../../api/data-items/day-structure-sleep-cycle.enum";
import { DayStructureDataItemType } from "../../../../api/data-items/day-structure-data-item-type.enum";
import * as moment from 'moment';

export class TimelogDayStructureItem implements DayStructureDataItem{
    ngStyle: any;
    ngClass: any;
    startTimeISO: string;
    endTimeISO: string;
    bodyLabel: string;
    startLabel: string;
    bodyBackgroundColor: string;
    activityCategoryDefinitionTreeId: string;
    sleepCycle: DayStructureSleepCycle;
    itemType: DayStructureDataItemType;

    constructor(dayStructureDataItem: DayStructureDataItem){
        this.startTimeISO = dayStructureDataItem.startTimeISO;
        this.endTimeISO = dayStructureDataItem.endTimeISO;
        this.bodyLabel = dayStructureDataItem.bodyLabel;
        this.startLabel = dayStructureDataItem.startLabel;
        this.bodyBackgroundColor = dayStructureDataItem.bodyBackgroundColor;
        this.activityCategoryDefinitionTreeId = dayStructureDataItem.activityCategoryDefinitionTreeId;
        this.sleepCycle = dayStructureDataItem.sleepCycle;
        this.itemType = dayStructureDataItem.itemType;
    }

    public get startTime(): moment.Moment{
        return moment(this.startTimeISO);
    }
    public get endTime(): moment.Moment{
        return moment(this.endTimeISO);
    }

    public border: string = "ALL";

    private _mouseIsOver: boolean = false;
    public get mouseIsOver(): boolean{
        return this._mouseIsOver;
    }
    public onMouseEnter(){
        this._mouseIsOver = true;
        if(this.border == "ALL"){
            this.ngClass = ["day-structure-item-border-all-hover"];
        }else if(this.border == "TOP"){
            this.ngClass = ["day-structure-item-border-top-hover"];
        }else if(this.border == "BOTTOM"){
            this.ngClass = ["day-structure-item-border-bottom-hover"];
        }
    }
    public onMouseLeave(){
        this._mouseIsOver = false;
        if(this.border == "ALL"){
            this.ngClass = [];
        }else if(this.border == "TOP"){
            this.ngClass = [];
        }else if(this.border == "BOTTOM"){
            this.ngClass = [];
        }
        
    }
}