import * as moment from 'moment';
import { TimelogEntryItem } from './timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { DaybookAvailabilityType } from '../../controller/items/daybook-availability-type.enum';


export class TimelogDisplayGridItem {

    constructor(startTime: moment.Moment, endTime: moment.Moment, percent: number, availability: DaybookAvailabilityType) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.percent = percent;

        this._availabilityType = availability;
    }

    private _drawTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
    private _creating = false;
    private _availabilityType: DaybookAvailabilityType;
    private _itemIndex: number = -1;

    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public percent: number;
    public isLargeGridItem: boolean = false;
    public isSmallGridItem: boolean = false;
    public isVerySmallItem: boolean = false;
    public isActiveFormItem: boolean = false;
    public isMerged: boolean = false;


    public get itemIndex(): number { return this._itemIndex; }

    public get availabilityType(): DaybookAvailabilityType { return this._availabilityType; }
    public get isAvailable(): boolean { return this._availabilityType === DaybookAvailabilityType.AVAILABLE };
    public get isTimelogEntry(): boolean { return this._availabilityType === DaybookAvailabilityType.TIMELOG_ENTRY; }
    public get isSleepEntry(): boolean { return this._availabilityType === DaybookAvailabilityType.SLEEP; }

    public get drawTimelogEntry(): TimelogEntryItem { return this._drawTLE$.getValue(); }
    public get drawTLE$(): Observable<TimelogEntryItem> { return this._drawTLE$.asObservable(); }

    public setItemIndex(index: number) { this._itemIndex = index; }
    public onDrawTimelogEntry(timelogEntry) {
        this._drawTLE$.next(timelogEntry);
    }
    public onCreateTimelogEntry(timelogEntry) {
        this._creating = true;
        this._drawTLE$.next(timelogEntry);
    }

    public stopDrawing() {
        if (!this._creating) {
            this._drawTLE$.next(null);
        }
    }
    public stopCreating() {
        this._creating = false;
        this._drawTLE$.next(null);
    }

    public timelogEntries: TimelogEntryItem[] = [];

    public toString(): string{
        return this.itemIndex + ": " + this.availabilityType + " - " + this.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.endTime.format('YYYY-MM-DD hh:mm a');
    }
}