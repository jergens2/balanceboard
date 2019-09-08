import { TimeOfDay } from "../../../../../../shared/utilities/time-of-day-enum";
import { DaybookDayItemScheduledActivity } from "../../../../api/data-items/daybook-day-item-scheduled-activity.class";

export enum TimelogEntryFormSectionType {
    WakeupSection,
    TimeOfDaySection,
    BedtimeSection
}

export class TimelogEntryFormSection {
    constructor(type: TimelogEntryFormSectionType, title: string) {
        this._sectionType = type;
        this.title = title;
    }

    public isComplete: boolean = false;

    private _isExpanded: boolean = false;
    public get isExpanded(): boolean { return this._isExpanded; }

    private _mouseIsOver: boolean = false;
    public get mouseIsOver(): boolean { return this._mouseIsOver; }
    public onMouseEnter() { this._mouseIsOver = true; }
    public onMouseLeave() { this._mouseIsOver = false; }

    public title: string = "";

    private _sectionType: TimelogEntryFormSectionType;
    public get sectionType(): TimelogEntryFormSectionType { return this._sectionType; }

    public get isWakeupSection(): boolean{
        return this._sectionType === TimelogEntryFormSectionType.WakeupSection;
    }
    public get isTimeOfDaySection(): boolean{
        return this._sectionType === TimelogEntryFormSectionType.TimeOfDaySection;
    }
    public get isBedtimeSection(): boolean{
        return this._sectionType === TimelogEntryFormSectionType.BedtimeSection;
    }

    public onClick() {
        if(!this.isExpanded && this.mouseIsOver){
            this._isExpanded = true;
        }        
    }
    public onClickClose(){
        this.minimize();
    }
    public minimize(){
        this._mouseIsOver = false;
        this._isExpanded = false;
    }

    public timeOfDay: TimeOfDay
    scheduledActivities: DaybookDayItemScheduledActivity[] = [];

}