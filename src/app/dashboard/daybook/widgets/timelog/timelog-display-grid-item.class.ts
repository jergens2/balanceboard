import * as moment from 'moment';
import { TimelogEntryItem } from './timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';

export enum TimelogDisplayGridItemType{
    SLEEP_START = 'SLEEP_START',
    TIMELOG_ENTRY = 'TIMELOG_ENTRY',
    AVAILABLE = 'AVAILABLE',
    SLEEP_END = 'SLEEP_END',
}
export class TimelogDisplayGridItem{

    constructor(startTime: moment.Moment, endTime:moment.Moment, percent: number, type: TimelogDisplayGridItemType){
        this.startTime = startTime;
        this.endTime = endTime;
        this.percent = percent;
        this.type = type;
    }

    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public percent: number;
    public type: TimelogDisplayGridItemType
    public isSmallGridItem: boolean = false;

    public timelogEntries: TimelogEntryItem[] = [];
}