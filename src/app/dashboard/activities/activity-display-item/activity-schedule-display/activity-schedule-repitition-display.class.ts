import { ActivityScheduleRepitition } from "../../api/activity-schedule-repitition.interface";
import { TimeUnit } from "../../../../shared/utilities/time-unit.enum";
import { ActivityOccurrenceConfiguration } from "../../api/activity-occurrence-configuration.interface";
import { Observable, Subject } from "rxjs";

export class ActivityScheduleRepititionDisplay {
    /**
     * This class is for the activity-schedule-display component primarily
     */
    constructor(repitition: ActivityScheduleRepitition) {
        this._unit = repitition.unit;
        this._frequency = repitition.frequency;
        this._occurrences = repitition.occurrences;
        this._startDateTimeISO = repitition.startDateTimeISO;
    }

    private _unit: TimeUnit;
    public get unit(): TimeUnit{ return this._unit; }
    public set unit(unit: TimeUnit){
        this._unit = unit;
        this.update();
    }

    private _frequency: number;
    public get frequency(): number{ return this._frequency; }
    public set frequency(frequency: number){
        this._frequency = frequency;
        this.update();
    }

    private _occurrences: ActivityOccurrenceConfiguration[];
    public get occurrences(): ActivityOccurrenceConfiguration[]{ return this._occurrences; }
    public set occurrences(occurrences: ActivityOccurrenceConfiguration[]){
        this._occurrences = occurrences;
        this.update();
    }

    private _startDateTimeISO: string;
    public get startDateTimeISO(): string{ return this._startDateTimeISO; }
    public set startDateTimeISO(startDateTimeISO: string){
        this._startDateTimeISO = startDateTimeISO;
        this.update();
    }


    private _isValidToSave: boolean = true;
    public get isValidToSave(): boolean{
        return this._isValidToSave;
    }

    private update(){
        let currentOccurrences: number = this.occurrences.filter((occurrence)=>{ return occurrence.unit == this.unit; }).length;
        if(currentOccurrences == 0){
            this._isValidToSave = false;
        }else if(currentOccurrences > 0){
            this._isValidToSave = true;
        }
        this._settingChanged$.next(this.isValidToSave);
    }
    private _settingChanged$: Subject<boolean> = new Subject();
    public get settingChanged$(): Observable<boolean>{
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

    // public get occurrencesPlurality(): string{
    //   if (this.occurrences.length == 1) {
    //     return "occurrence"
    //   }
    //   if (this.occurrences.length > 1) {
    //     return "occurrences"
    //   }
    //   return "";
    // }
    
    

}