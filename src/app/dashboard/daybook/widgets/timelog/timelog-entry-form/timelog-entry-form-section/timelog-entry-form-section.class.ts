import { TimeOfDay } from "../../../../../../shared/utilities/time-of-day-enum";
import { DaybookDayItemScheduledActivity } from "../../../../api/data-items/daybook-day-item-scheduled-activity.class";
import { Subject, Observable } from "rxjs";

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
    private _saveChanges$: Subject<boolean> = new Subject();
    public get onSaveChanges$(): Observable<boolean>{
        return this._saveChanges$.asObservable();
    }
    public onClickSave(){
        this.scheduledActivities.forEach((scheduledActivity)=>{
            if(scheduledActivity.isRoutine){
                scheduledActivity.routineMemberActivities.forEach((memberItem)=>{
                    memberItem.saveChanges();
                });
            }else if(!scheduledActivity.isRoutine){
                
            }
        })
        this._saveChanges$.next(true);
        this.onClickClose();
    }
    public minimize(){
        this._mouseIsOver = false;
        this._isExpanded = false;
    }

    public timeOfDay: TimeOfDay
    scheduledActivities: DaybookDayItemScheduledActivity[] = [];

}