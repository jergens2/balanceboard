import * as moment from 'moment';
import { TimelogEntryItem } from './timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookAvailabilityType } from '../../controller/items/daybook-availability-type.enum';
import { Observable, Subject, BehaviorSubject } from 'rxjs';


export class TimelogDisplayGridItem{

    constructor(startTime: moment.Moment, endTime:moment.Moment, percent: number, availability: DaybookAvailabilityType){
        this.startTime = startTime;
        this.endTime = endTime;
        this.percent = percent;
        this.availability = availability;
    }

    private _drawTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
    private _creating = false;

    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public percent: number;
    public availability: DaybookAvailabilityType
    public isSmallGridItem: boolean = false;

    public isActiveFormItem: boolean = false;

    public get drawTimelogEntry(): TimelogEntryItem { return this._drawTLE$.getValue(); }
    public get drawTLE$(): Observable<TimelogEntryItem> { return this._drawTLE$.asObservable(); }

    public onDrawTimelogEntry(timelogEntry){
        this._drawTLE$.next(timelogEntry);
    }
    public onCreateTimelogEntry(timelogEntry){
        this._creating = true;
        this._drawTLE$.next(timelogEntry);
    }

    public stopDrawing(){
        if(!this._creating){
            this._drawTLE$.next(null);
        }
    }
    public stopCreating(){
        this._creating = false;
        this._drawTLE$.next(null);
    }

    public timelogEntries: TimelogEntryItem[] = [];
}