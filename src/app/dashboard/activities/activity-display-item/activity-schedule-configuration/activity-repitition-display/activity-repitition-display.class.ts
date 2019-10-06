import { ActivityScheduleRepitition } from "../../../api/activity-schedule-repitition.interface";
import { TimeUnit } from "../../../../../shared/utilities/time-utilities/time-unit.enum";
import { ActivityOccurrenceConfiguration } from "../../../api/activity-occurrence-configuration.interface";
import { Observable, Subject, Subscription } from "rxjs";
import { ActivityRepititionOccurrence } from "./repitition-occurrence/repitition-occurrence.class";
import { ItemState } from "../../../../../shared/utilities/item-state.class";
import { TimeOfDay } from "../../../../../shared/utilities/time-utilities/time-of-day-enum";

export class ActivityRepititionDisplay {
    /**
     * This class is for the activity-schedule-display component primarily
     */



    constructor(repitition: ActivityScheduleRepitition) {
        this.rebuild(repitition);
    }

    private rebuild(repitition: ActivityScheduleRepitition){
        this._itemState = new ItemState(repitition);
        this._unit = repitition.unit;
        this._frequency = repitition.frequency;

        let occurrences: ActivityRepititionOccurrence[] = [];
        if(repitition.occurrences.length == 0){
            this.onClickNewOccurrence();
        }else if(repitition.occurrences.length > 0){
            repitition.occurrences.forEach((occurrenceConfig) => {
                occurrences.push(new ActivityRepititionOccurrence(occurrenceConfig));
            });
        }
        this._occurrences = occurrences;


        this.updateOccurrenceChangeSubscriptions();
        this._startDateTimeISO = repitition.startDateTimeISO;

        this._itemState.reset();
        this.updateValidity();

    }

    private _itemState: ItemState;

    public get itemState(): ItemState { return this._itemState; }
    public get isNew(): boolean { return this._itemState.isNew; }
    public set isNew(isNew: boolean){ this._itemState.isNew = isNew; }
    public get isChangd(): boolean{ return this._itemState.isChanged; }
    public get isEditing(): boolean { return this._itemState.isEditing };
    public get isValid(): boolean{ return this._itemState.isValid; }


    public onClickEdit() {
        this._itemState.startEditing();
    }
    public onCancelEditing(){
        this.rebuild(this._itemState.cancelAndReturnOriginalValue());
    }
    public onClickDelete() {
        this._itemState.onClickDelete();
    }
    public stopEditing() {
        this._itemState.isEditing = false;
    }

    public get unsavedChanges(): boolean {
        return this._itemState.isChanged;
    }

    public get exportRepititionItem(): ActivityScheduleRepitition {
        return {
            unit: this.unit,
            frequency: this.frequency,
            occurrences: this.occurrences.map((occurrence) => { return occurrence.config; }),
            startDateTimeISO: this.startDateTimeISO,
        }
    }

    private _unit: TimeUnit;
    public get unit(): TimeUnit { return this._unit; }
    public set unit(unit: TimeUnit) {
        this._unit = unit;
        this._itemState.isChanged = true;
        this.updateValidity();
    }

    private _frequency: number;
    public get frequency(): number { return this._frequency; }
    public set frequency(frequency: number) {
        this._frequency = frequency;
        this._itemState.isChanged = true;
        this.updateValidity();
    }

    private _occurrences: ActivityRepititionOccurrence[] = [];
    public get occurrences(): ActivityRepititionOccurrence[] { return this._occurrences; }
    public set occurrences(occurrences: ActivityRepititionOccurrence[]) {
        this._occurrences = occurrences;
        this.updateOccurrenceChangeSubscriptions();
        this._itemState.isChanged = true;
        this.updateValidity();
    }

    public get occurrencesCount(): string{
        if(this.newOccurrence){
            return (this.occurrences.length + 1).toFixed(0);
        }else{
            return (this.occurrences.length).toFixed(0);
        }
    }

    private occurrenceChangeSubscriptions: Subscription[] = [];
    private updateOccurrenceChangeSubscriptions() {
        this.occurrenceChangeSubscriptions.forEach((sub) => { sub.unsubscribe(); });
        this.occurrenceChangeSubscriptions = [];
        this._occurrences.forEach((occurrence) => {
            this.occurrenceChangeSubscriptions.push(occurrence.delete$.subscribe((onDelete) => {
                // console.log("occurrence delete signal");
                this.deleteOccurrence(occurrence);
            }));
            this.occurrenceChangeSubscriptions.push(occurrence.isValid$.subscribe((isValid: boolean) => {
                
                this._itemState.isValid = this.validityOfOccurrences();
                // console.log("occurrence isValid signal: , ", this._itemState.isValid);
            }));
            this.occurrenceChangeSubscriptions.push(occurrence.isEditing$.subscribe((onEditing) => {
                this.updateValidity();
                // console.log("occurrence edit signal: , ");
            }));
        });
        if(this.newOccurrence){
            this.occurrenceChangeSubscriptions.push(this.newOccurrence.delete$.subscribe((onDelete) => {
                this.closeNewOccurrence();
            }));
            this.occurrenceChangeSubscriptions.push(this.newOccurrence.isValid$.subscribe((isValid: boolean) => {    
                this._itemState.isValid = this.validityOfOccurrences();
            }));

        }
    }

    private validityOfOccurrences(): boolean {
        let allValid: boolean = true;
        for (let i = 0; i < this.occurrences.length; i++) {
            if (!this.occurrences[i].isValid || this.occurrences[i].isEditing) {
                allValid = false;
            }
        }
        return allValid;
    }

    public get occurrenceTimes(): string {
        if (this.occurrences.length == 1) {
            return "1 time";
        } else if (this.occurrences.length > 1) {
            return this.occurrences.length + " times";
        } else {
            return "error";
        }
    }

    private _startDateTimeISO: string;
    public get startDateTimeISO(): string { return this._startDateTimeISO; }
    public set startDateTimeISO(startDateTimeISO: string) {
        this._startDateTimeISO = startDateTimeISO;
        this._itemState.isChanged = true;
        this.updateValidity();
    }

    public updateOccurrence(saveOccurrence: ActivityRepititionOccurrence) {
        this._itemState.isChanged = true;
        let occurrences = this.occurrences;
        let index: number = occurrences.findIndex((item) => { return item.index == saveOccurrence.index; })
        occurrences.splice(index, 1, saveOccurrence);
        this.occurrences = this.reIndex(occurrences);
    }
    public deleteOccurrence(deleteOccurrence: ActivityRepititionOccurrence) {
        this._itemState.isChanged = true;
        let occurrences = this.occurrences;
        if (occurrences.length == 1) {
            occurrences = [];
        } else {
            let index: number = occurrences.findIndex((item) => { return item.index == deleteOccurrence.index; });
            console.log("Index is ", index);
            occurrences.splice(index, 1);
        }
        console.log("Going to reindex these: ", occurrences);
        this.occurrences = this.reIndex(occurrences);
    }

    public onSaveNewOccurrence() {
        if (this.newOccurrence != null) {
            console.log("onSaveNewOccurrence");
            this.newOccurrence.isEditing = false;
            let occurrences: ActivityRepititionOccurrence[] = this.occurrences;
            if (this.newOccurrence.index == -1) {
                this.newOccurrence.index = this.occurrences.length;
            }
            occurrences.push(this.newOccurrence);
            this.newOccurrence = null;
            this.occurrences = this.reIndex(occurrences);;
        } else {
            
        }
        
    }

    private reIndex(occurrences: ActivityRepititionOccurrence[]): ActivityRepititionOccurrence[] {
        console.log("Reindexing: ", occurrences.length, occurrences);
        if (occurrences.length > 1) {
            occurrences = occurrences.sort((o1, o2) => {
                if (o1.index < o2.index) {
                    return -1;
                } else if (o1.index > o2.index) {
                    return 1;
                } else {
                    return 0;
                }
            });
            for (let i = 0; i < occurrences.length; i++) {
                occurrences[i].index = i;
            }
        } else {
            if (occurrences.length == 1) {
                occurrences[0].index = 0;
            }
        }
        console.log("Reindex complete: ", occurrences);
        return occurrences;
    }

    private updateValidity() {
        let isValidToSave: boolean = true;
        let currentOccurrences: number = this.occurrences.filter((occurrence) => { return occurrence.unit == this.unit; }).length;
        if (currentOccurrences == 0) {
            isValidToSave = false;
            // console.log("** false because no items");
        } else if (currentOccurrences > 0) {
            isValidToSave = this.validityOfOccurrences();
            // console.log("** validityOfOccurrences = " , this.validityOfOccurrences());
        }
        if(this.newOccurrence){
            // console.log("** False because there is a new occurrence.")
            isValidToSave = false;
        }

        console.log("Activity Repitition Display is valid?: ", isValidToSave);
        this._itemState.isValid = isValidToSave;
        // this._itemState.isNew = false;
    }



    public get dayOfWeekListItems(): string[] {
        if (this.frequency == 1) {
            return [
                "day",
                "week",
                "month",
                "year",
            ];
        } else if (this.frequency > 1) {
            return [
                "days",
                "weeks",
                "months",
                "years",
            ];
        }
        return [];
    }

    public get timeUnitFrameString(): string {
        if (this.frequency == 1) {
            if (this.unit == TimeUnit.Day) { return "day"; }
            if (this.unit == TimeUnit.Week) { return "week"; }
            if (this.unit == TimeUnit.Month) { return "month"; }
            if (this.unit == TimeUnit.Year) { return "year"; }
        } else if (this.frequency > 1) {
            if (this.unit == TimeUnit.Day) { return "days"; }
            if (this.unit == TimeUnit.Week) { return "weeks"; }
            if (this.unit == TimeUnit.Month) { return "months"; }
            if (this.unit == TimeUnit.Year) { return "years"; }
        }
        return "";
    }



    public newOccurrence: ActivityRepititionOccurrence;
    public onClickNewOccurrence() {
        this.newOccurrence = new ActivityRepititionOccurrence({
      
            index: -1,
            unit: TimeUnit.Day,
      
            minutesPerOccurrence: -1,
            timeOfDayQuarter: TimeOfDay.Any,
            timeOfDayHour: -1,
            timeOfDayMinute: -1,
      
      
            timesOfDay: [],
            timesOfDayRanges: [],
      
            timesOfDayExcludedRanges: [],
      
            daysOfWeek: [],
            daysOfWeekExcluded: [],
      
            daysOfYear: [],
          });
        this.newOccurrence.isNew = true;
        this._itemState.isChanged = true;
        this.updateOccurrenceChangeSubscriptions();
    }
    private closeNewOccurrence(){
        this.newOccurrence = null;
        this._itemState.updateIsChanged(this.exportRepititionItem);
        this.updateValidity();
        this.updateOccurrenceChangeSubscriptions();
    }


    public onMouseLeave() {
        this._itemState.onMouseLeave();
    }
    public onMouseEnter() {
        this._itemState.onMouseEnter();
    }
    public get mouseIsOver(): boolean {
        return this._itemState.mouseIsOver;
    }


}