import { TimelogZoomItem } from './timelog-zoom-item.class';
import { faSun, faList, faSearch } from '@fortawesome/free-solid-svg-icons';
import { DaybookTimeSchedule } from '../../../../display-manager/daybook-time-schedule/daybook-time-schedule.class';
import * as moment from 'moment';
import { TimelogZoomType } from './timelog-zoom-type.enum';
import { Observable } from 'rxjs';
import { SleepCycleScheduleItemsBuilder } from '../../../../sleep-manager/sleep-cycle/sleep-cycle-schedule-items-builder.class';
import { TimeRounder } from '../../../../../../shared/time-utilities/time-rounder';

export class TimelogZoomController {

    public readonly faList = faList;
    public readonly faSun = faSun;
    public readonly faSearch = faSearch;

    private _schedule: DaybookTimeSchedule;
    private _zoomItems: TimelogZoomItem[] = [];
    private _currentZoom: TimelogZoomItem;
    private _sleepCycle: SleepCycleScheduleItemsBuilder;

    private _customStartTime: moment.Moment;
    private _customEndTime: moment.Moment;

    /**
     * The purpose of this class is to set and allow for the changing of the zoom on the timelog.
     * 
     * This class has variables that depend on the current time, 
     * and these variables are updated by the parent class every minute.
     */
    constructor(schedule: DaybookTimeSchedule, sleepCycle: SleepCycleScheduleItemsBuilder) {
        this._schedule = schedule;
        this._sleepCycle = sleepCycle;
        this._buildZoomItems();
        this.setZoom(TimelogZoomType.AWAKE_PERIOD);
    }

    public update(schedule: DaybookTimeSchedule, sleepCycle: SleepCycleScheduleItemsBuilder) {
        this._schedule = schedule;
        this._sleepCycle = sleepCycle;
        this._updateZoomItems();
    }


    public get zoomItems(): TimelogZoomItem[] { return this._zoomItems; }

    public get displayStartTime(): moment.Moment { return this._currentZoom.startTime; }
    public get displayEndTime(): moment.Moment { return this._currentZoom.endTime; }
    public get displayDurationMs(): number { return moment(this.displayEndTime).diff(this.displayStartTime, 'milliseconds'); }

    public get currentZoom(): TimelogZoomItem { return this._currentZoom; }
    public get zoomIs24(): boolean { return this.currentZoom.zoomType === TimelogZoomType.TWENTY_FOUR_HOURS; }
    public get zoomIs8(): boolean { return this.currentZoom.zoomType === TimelogZoomType.EIGHT_HOUR_WINDOW; }
    public get zoomIsAwake(): boolean { return this.currentZoom.zoomType === TimelogZoomType.AWAKE_PERIOD; }
    public get zoomIsList(): boolean { return this.currentZoom.zoomType === TimelogZoomType.LIST_VIEW; }
    public get zoomIsCustom(): boolean { return this.currentZoom.zoomType === TimelogZoomType.CUSTOM; }



    public setZoom(zoomType: TimelogZoomType) {
        this._currentZoom = this.zoomItems.find(item => item.zoomType === zoomType);
    }


    private _buildZoomItems() {
        const startOfThisDay: moment.Moment = this._schedule.startOfThisDay;
        const endOfThisDay: moment.Moment = this._schedule.endOfThisDay;
        const now: moment.Moment = moment();
        const minus4Hours = TimeRounder.roundDownToFloor(moment(now).subtract(4, 'hours'), 30);
        const plus4Hours = TimeRounder.roundUpToCeiling(moment(now).add(4, 'hours'), 30);
        const wakeupTime: moment.Moment = TimeRounder.roundDownToFloor(
            moment(this._sleepCycle.previousWakeupTime).subtract(15, 'minutes'), 30);
        const fallAsleepTime: moment.Moment = TimeRounder.roundUpToCeiling(
            moment(this._sleepCycle.nextFallAsleepTime).add(15, 'minutes'), 30);
        this._customStartTime = moment(wakeupTime);
        this._customEndTime = moment(fallAsleepTime);
        this._zoomItems = [
            new TimelogZoomItem(startOfThisDay, endOfThisDay, TimelogZoomType.TWENTY_FOUR_HOURS, null, '24'),
            new TimelogZoomItem(minus4Hours, plus4Hours, TimelogZoomType.EIGHT_HOUR_WINDOW, null, '8'),
            new TimelogZoomItem(wakeupTime, fallAsleepTime, TimelogZoomType.AWAKE_PERIOD, faSun, 'AWAKE'),
            new TimelogZoomItem(startOfThisDay, endOfThisDay, TimelogZoomType.LIST_VIEW, faList, 'LIST'),
            new TimelogZoomItem(this._customStartTime, this._customEndTime, TimelogZoomType.CUSTOM, faSearch, 'CUSTOM'),
        ];
    }


    private _updateZoomItems() {
        const currentZoomType = this.currentZoom.zoomType;
        this._buildZoomItems();
        this.setZoom(currentZoomType);
    }
}
