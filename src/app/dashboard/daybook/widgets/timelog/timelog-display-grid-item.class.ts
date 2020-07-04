import * as moment from 'moment';
import { TimelogEntryItem } from './timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { DaybookTimeScheduleStatus } from '../../api/daybook-time-schedule/daybook-time-schedule-status.enum';
import { TimeScheduleItem } from '../../../../shared/time-utilities/time-schedule-item.class';


export class TimelogDisplayGridItem extends TimeScheduleItem{

    constructor(startTime: moment.Moment, endTime: moment.Moment, percent: number, status: DaybookTimeScheduleStatus, timelogEntry?: TimelogEntryItem) {
        super(startTime.toISOString(), endTime.toISOString());
        this.percent = percent;

        this._timeScheduleStatus = status;
        if(timelogEntry){
            this.timelogEntries = [timelogEntry];
        }
    }
    private _timeScheduleStatus: DaybookTimeScheduleStatus;
    // private _itemIndex: number = -1;
    private _isDrawing: boolean = false;


    public percent: number;
    public isLargeGridItem: boolean = false;
    public isSmallGridItem: boolean = false;
    public isVerySmallItem: boolean = false;
    public isActiveFormItem: boolean = false;
    public isMerged: boolean = false;
    public get durationMS(): number { return moment(this.endTime).diff(moment(this.startTime), 'milliseconds'); }
    // public get itemIndex(): number { return this._itemIndex; }
    public get timeScheduleStatus(): DaybookTimeScheduleStatus { return this._timeScheduleStatus; }
    public get isAvailable(): boolean { return this._timeScheduleStatus === DaybookTimeScheduleStatus.AVAILABLE };
    public get isTimelogEntry(): boolean { return this._timeScheduleStatus === DaybookTimeScheduleStatus.ACTIVE; }
    public get isSleepEntry(): boolean { return this._timeScheduleStatus === DaybookTimeScheduleStatus.SLEEP; }
    public get isDrawing(): boolean { return this._isDrawing; }

    // public setItemIndex(index: number) { this._itemIndex = index; }
    public setIsDrawing(){ this._isDrawing = true; }
    public timelogEntries: TimelogEntryItem[] = [];

    public toString(): string{
        return this.timeScheduleStatus + "  " + this.percent.toFixed(0) + " % " 
        + "\n\t " + this.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.endTime.format('YYYY-MM-DD hh:mm a');
    }
}