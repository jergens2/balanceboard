import { ActivityOccurrenceConfiguration } from "../../../../../api/activity-occurrence-configuration.interface";
import { TimeUnit } from "../../../../../../../shared/time-utilities/time-unit.enum";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { ItemState } from "../../../../../../../shared/utilities/item-state.class";

export class ActivityRepititionOccurrence{

        
    /**
     * index: number;
    unit: TimeUnit;
    

    minutesPerOccurrence: number;
    timeOfDayQuarter: TimeOfDay;
    timeOfDayHour: number;
    timeOfDayMinute: number;


    timesOfDay: TimeOfDay[],
    timesOfDayRanges: TimeRange[],

    timesOfDayExcludedRanges: TimeRange[],

    daysOfWeek: DayOfWeek[],
    daysOfWeekExcluded: DayOfWeek[],

    daysOfYear: number[],
}
     */
    
    private _config: ActivityOccurrenceConfiguration
    constructor(config: ActivityOccurrenceConfiguration){
        this._config = config;
        this._itemState = new ItemState(this._config);
    }

    public get config(): ActivityOccurrenceConfiguration{
        return this._config;
    }

    public get index(): number{ return this._config.index; }
    public set index(index: number){ this._config.index = index; }
    public get unit(): TimeUnit{ return this._config.unit; }
    public set unit(unit: TimeUnit){ this._config.unit = unit; }



    public get isValid(): boolean{
        return this._itemState.isValid;
    }
    public get isValid$(): Observable<boolean>{
        return this._itemState.isValid$;
    }
    public get isNew(): boolean{
        return this._itemState.isNew;
    }
    public set isNew(isNew: boolean){
        this._itemState.isNew = isNew;
    }



    private _itemState: ItemState;
    public get itemState(): ItemState{
        return this._itemState;
    }
    public set itemState(state: ItemState){
        this._itemState = state;
    }



    public get isEditing(): boolean{
        return this._itemState.isEditing;
    }
    public set isEditing(isEditing: boolean){
        this._itemState.isEditing = isEditing;
    }


    public onClickDelete(){
      this._delete$.next(true);
    }
    private _delete$: Subject<boolean> = new Subject();
    public get delete$(): Observable<boolean>{
        return this._delete$.asObservable();
    }
    public get isEditing$(): Observable<boolean> {
        return this._itemState.isEditing$;
    }

    public onClickEdit(){ 
        this._itemState.startEditing();
    }

    public onClickCancel(){
        let originalValue = this._itemState.cancelAndReturnOriginalValue();
    }
  
    // public onClickMinusFrequency(){
  
    // }
    // public onClickPlusFrequency(){
  
    // }
  
    public onMouseEnter(){
      this._mouseIsOver = true;
    }
    public onMouseLeave(){
      this._mouseIsOver = false;
    }
    public get mouseIsOver(): boolean{
      return this._mouseIsOver;
    }
    private _mouseIsOver: boolean = false;
}