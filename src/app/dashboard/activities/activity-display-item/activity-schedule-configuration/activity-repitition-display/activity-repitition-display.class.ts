import { ActivityScheduleRepitition } from "../../../api/activity-schedule-repitition.interface";
import { TimeUnit } from "../../../../../shared/utilities/time-unit.enum";
import { ActivityOccurrenceConfiguration } from "../../../api/activity-occurrence-configuration.interface";
import { Observable, Subject } from "rxjs";

export class ActivityRepititionDisplay {
    /**
     * This class is for the activity-schedule-display component primarily
     */



    constructor(repitition: ActivityScheduleRepitition) {
        this._unit = repitition.unit;
        this._frequency = repitition.frequency;
        this._occurrences = repitition.occurrences;
        this._startDateTimeISO = repitition.startDateTimeISO;
        this.update();
    }

    private _isEditing: boolean = false;
    public get isEditing(): boolean {
        return this._isEditing;
    }
    public onClickEdit(){
        this._isEditing = true;
    }
    public onCancelEditing(){
        this._isEditing = false;
    }
    public onClickDelete(){
        console.log("Delete: Disabled");
    }

    private _unsavedChanges: boolean = false;
    public get unsavedChanges(): boolean{
        return this._unsavedChanges;
    }

    public get repititionItem(): ActivityScheduleRepitition {
        return {
            unit: this.unit,
            frequency: this.frequency,
            occurrences: this.occurrences,
            startDateTimeISO: this.startDateTimeISO,
        }
    }

    private _unit: TimeUnit;
    public get unit(): TimeUnit { return this._unit; }
    public set unit(unit: TimeUnit) {
        this._unit = unit;
        this.update();
    }

    private _frequency: number;
    public get frequency(): number { return this._frequency; }
    public set frequency(frequency: number) {
        this._frequency = frequency;
        this.update();
    }

    private _occurrences: ActivityOccurrenceConfiguration[];
    public get occurrences(): ActivityOccurrenceConfiguration[] { return this._occurrences; }
    public set occurrences(occurrences: ActivityOccurrenceConfiguration[]) {
        this._occurrences = occurrences;
        this.update();
    }

    public get occurrenceTimes(): string{
        if(this.occurrences.length == 1){
            return "1 time";
        }else if(this.occurrences.length > 1){
            return this.occurrences.length + " times";
        }else{
            return "error";
        }
    }

    private _startDateTimeISO: string;
    public get startDateTimeISO(): string { return this._startDateTimeISO; }
    public set startDateTimeISO(startDateTimeISO: string) {
        this._startDateTimeISO = startDateTimeISO;
        this.update();
    }

    public updateOccurrence(saveOccurrence: ActivityOccurrenceConfiguration) {
        this._unsavedChanges = true;
        let occurrences = this.occurrences;
        let index: number = occurrences.findIndex((item) => { return item.index == saveOccurrence.index; })
        occurrences.splice(index, 1, saveOccurrence);
        this.occurrences = this.reIndex(occurrences);
    }
    public deleteOccurrence(deleteOccurrence: ActivityOccurrenceConfiguration) {
        this._unsavedChanges = true;
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

    public onSaveNewOccurrence(occurrence: ActivityOccurrenceConfiguration) {
        if (occurrence != null) {
            console.log("onSaveNewOccurrence");
            let occurrences: ActivityOccurrenceConfiguration[] = this.occurrences;
            if (occurrence.index == -1) {
                occurrence.index = this.occurrences.length;
            }
            occurrences.push(occurrence);

            this.occurrences = this.reIndex(occurrences);;
        } else {
            this._newOccurrenceFormOpen = false;
        }
    }

    private reIndex(occurrences: ActivityOccurrenceConfiguration[]): ActivityOccurrenceConfiguration[] {
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




    private _isValidToSave: boolean = false;
    public get isValidToSave(): boolean {
        return this._isValidToSave;
    }

    private update() {
        let currentOccurrences: number = this.occurrences.filter((occurrence) => { return occurrence.unit == this.unit; }).length;
        if (currentOccurrences == 0) {
            this._isValidToSave = false;
        } else if (currentOccurrences > 0) {
            this._isValidToSave = true;
        }
        this._settingChanged$.next(this.isValidToSave);
        this._newOccurrenceFormOpen = false;
    }
    private _settingChanged$: Subject<boolean> = new Subject();
    public get settingChanged$(): Observable<boolean> {
        return this._settingChanged$.asObservable();
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

    private _newOccurrenceFormOpen: boolean = false;
    public get newOccurrenceFormOpen(): boolean {
        return this._newOccurrenceFormOpen;
    }
    public onClickNewOccurrence() {
        console.log("clickeroo")
        this._newOccurrenceFormOpen = true;
    }
    public onClickSaveNewOccurrence() {

    }

    public onMouseLeave() {
        this._mouseIsOver = false;
        console.log("mouse no lka")
    }
    public onMouseEnter() {
        this._mouseIsOver = true;
        console.log("mouse la")
    }
    private _mouseIsOver: boolean = false;
    public get mouseIsOver(): boolean {
        return this._mouseIsOver;
    }


}