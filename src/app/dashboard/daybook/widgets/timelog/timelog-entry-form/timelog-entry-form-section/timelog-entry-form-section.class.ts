import { TimeOfDay } from "../../../../../../shared/utilities/time-of-day-enum";
import { DaybookDayItemScheduledActivity } from "../../../../api/data-items/daybook-day-item-scheduled-activity.class";
import { Subject, Observable } from "rxjs";
import * as moment from 'moment';

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

    private _mouseIsOverTitle: boolean = false;
    public get mouseIsOverTitle(): boolean{ return this._mouseIsOverTitle; }
    public onMouseEnterTitle(){ this._mouseIsOverTitle = true; }  
    public onMouseLeaveTitle(){ this._mouseIsOverTitle = false; }

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
    public get timeOfDayRange(): { startTime: moment.Moment, endTime: moment.Moment}{
        if(this.isTimeOfDaySection){
            if(this.timeOfDay == TimeOfDay.EarlyMorning){
                return {
                    startTime: moment().startOf("day"),
                    endTime: moment().startOf("day").add(6, "hours"),
                };
            }else if(this.timeOfDay == TimeOfDay.Morning){
                return {
                    startTime: moment().startOf("day").add(6, "hours"),
                    endTime: moment().startOf("day").add(12, "hours"),
                };
            }else if(this.timeOfDay == TimeOfDay.Afternoon){
                return {
                    startTime: moment().startOf("day").add(12, "hours"),
                    endTime: moment().startOf("day").add(18, "hours"),
                };
            }else if(this.timeOfDay == TimeOfDay.Evening){
                return {
                    startTime: moment().startOf("day").add(18, "hours"),
                    endTime: moment().endOf("day"),
                };
            }
        }else{
            return null;
        }
    }
    
    private _isBeforeCurrentTimeSection: boolean = false;
    private _isCurrentTimeSection: boolean = false;
    private _isAfterCurrentTimeSection: boolean = false;
    public get isBeforeCurrentTimeSection(): boolean{ return this._isBeforeCurrentTimeSection; }
    public get isCurrentTimeSection(): boolean{ return this._isCurrentTimeSection; }
    public get isAfterCurrentTimeSection(): boolean{ return this._isAfterCurrentTimeSection; }

    public updateCurrentTimeSection(time: moment.Moment){
        if(this.isTimeOfDaySection && this.timeOfDayRange){
            if(time.isSameOrAfter(this.timeOfDayRange.startTime) && time.isSameOrBefore(this.timeOfDayRange.endTime)){
                this._isCurrentTimeSection = true;
                this._isBeforeCurrentTimeSection = false;
                this._isAfterCurrentTimeSection = false;
            }else if(time.isBefore(this.timeOfDayRange.startTime)){
                this._isCurrentTimeSection = false;
                this._isBeforeCurrentTimeSection = false;
                this._isAfterCurrentTimeSection = true;
            }else if(time.isAfter(this.timeOfDayRange.endTime)){
                this._isAfterCurrentTimeSection = false;
                this._isBeforeCurrentTimeSection = true;
                this._isCurrentTimeSection = false;
            }else{
                console.log("all false");
                this._isAfterCurrentTimeSection = false;
                this._isBeforeCurrentTimeSection = false;
                this._isCurrentTimeSection = false;
            }
        }
    }



    public onClick() {
        if(!this.isExpanded && this.mouseIsOver){
            this._isExpanded = true;
        }        
    }

    public onClickTitle(){
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

    public timeOfDay: TimeOfDay;
    scheduledActivities: DaybookDayItemScheduledActivity[] = [];

}