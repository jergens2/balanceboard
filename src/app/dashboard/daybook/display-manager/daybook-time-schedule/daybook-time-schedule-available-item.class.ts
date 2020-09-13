import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import * as moment from 'moment';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { TimelogDelineator } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';

export class DaybookTimeScheduleAvailableItem extends DaybookTimeScheduleItem {

    private _availableSectionIndex: number;

    constructor(start: TimelogDelineator, end: TimelogDelineator) {
        super(start.time, end.time);
        this._startDelineator = start;
        this._endDelineator = end;
        this._scheduleStatus = DaybookTimeScheduleStatus.AVAILABLE;
        this._availableSectionIndex = -1;
    }

    public get availableSectionIndex(): number { return this._availableSectionIndex; }
}
