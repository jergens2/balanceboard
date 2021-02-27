import { TimelogZoomItem } from './timelog-zoom-item.class';
import { faSun, faList, faSearch } from '@fortawesome/free-solid-svg-icons';
import { DaybookTimeSchedule } from '../../../../display-manager/daybook-time-schedule/daybook-time-schedule.class';
import * as moment from 'moment';
import { TimelogZoomType } from './timelog-zoom-type.enum';
import { Observable } from 'rxjs';
import { SleepCycleScheduleItemsBuilder } from '../../../../sleep-manager/sleep-cycle/sleep-cycle-schedule-items-builder.class';
import { TimeRounder } from '../../../../../../shared/time-utilities/time-rounder';
import { UserAccountProfileService } from 'src/app/app-pages/user-account-profile/user-account-profile.service';

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

    private _dateYYYYMMDD: string;

    private _profileService: UserAccountProfileService;

    /**
     * The purpose of this class is to set and allow for the changing of the zoom on the timelog.
     * 
     * This class has variables that depend on the current time, 
     * and these variables are updated by the parent class every minute.
     */
    constructor(schedule: DaybookTimeSchedule, sleepCycle: SleepCycleScheduleItemsBuilder, dateYYYYMMDD: string, profileService: UserAccountProfileService) {
        this._schedule = schedule;
        this._sleepCycle = sleepCycle;
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._profileService = profileService;
        this._buildZoomItems();

        const listMode: boolean = this._profileService.appPreferences.daybook.listMode;
        if(listMode === true){
            this.setZoom(TimelogZoomType.LIST_VIEW);
        }else{
            this.setZoom(TimelogZoomType.AWAKE_PERIOD);
        }
    }

    public update(schedule: DaybookTimeSchedule, sleepCycle: SleepCycleScheduleItemsBuilder, dateYYYYMMDD: string) {
        this._schedule = schedule;
        this._sleepCycle = sleepCycle;
        this._dateYYYYMMDD = dateYYYYMMDD;
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
        // console.log("setting zoom: " + zoomType);
        this.zoomItems.forEach(item => item.isActive = false);
        // console.log("ZOOM ITEMS")
        // this.zoomItems.forEach(item => console.log("ITEM: " + item.toString()))
        this._currentZoom = this.zoomItems.find(item => item.zoomType === zoomType);
        this._currentZoom.isActive = true;
        if(zoomType === TimelogZoomType.LIST_VIEW){
            this._profileService.appPreferences.daybook.listMode = true;
        }else{
            this._profileService.appPreferences.daybook.listMode = false;
        }
        // console.log("Setting zoom")
        this._profileService.saveChanges$();
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
            // new TimelogZoomItem(this._customStartTime, this._customEndTime, TimelogZoomType.CUSTOM, faSearch, 'CUSTOM'),
        ];
        const today = moment().format('YYYY-MM-DD');
        if (this._dateYYYYMMDD !== today) {
            this._zoomItems.splice(this._zoomItems.findIndex(item => item.zoomType === TimelogZoomType.EIGHT_HOUR_WINDOW), 1);
        }
        this.zoomItems[0].isFirst = true;
        this.zoomItems[this.zoomItems.length - 1].isLast = true;
    }

    private _updateZoomItems() {
        let currentZoomType = this.currentZoom.zoomType;
        const today = moment().format('YYYY-MM-DD');
        if (this._dateYYYYMMDD !== today) {
            if (currentZoomType === TimelogZoomType.EIGHT_HOUR_WINDOW) {
                currentZoomType = TimelogZoomType.AWAKE_PERIOD;
            }
        }
        this._buildZoomItems();
        this.setZoom(currentZoomType);
    }
}
