import * as moment from 'moment';
import { TimelogEntryItem } from './timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookAvailabilityType } from '../../controller/items/daybook-availability-type.enum';


export class TimelogDisplayGridItem{

    constructor(startTime: moment.Moment, endTime:moment.Moment, percent: number, type: DaybookAvailabilityType){
        this.startTime = startTime;
        this.endTime = endTime;
        this.percent = percent;
        this.type = type;
    }

    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public percent: number;
    public type: DaybookAvailabilityType
    public isSmallGridItem: boolean = false;

    public timelogEntries: TimelogEntryItem[] = [];
}