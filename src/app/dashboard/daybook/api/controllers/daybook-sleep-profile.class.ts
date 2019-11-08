import { DaybookDayItemSleepProfileData } from '../data-items/daybook-day-item-sleep-profile-data.interface';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { SleepQuality } from '../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum';
import { DaybookDayItemHttpShape } from '../daybook-day-item-http-shape.interface';

export class DaybookSleepProfile {


    constructor(httpShape: DaybookDayItemHttpShape) {
        this._sleepProfileData = httpShape.sleepProfile;
        this._dateYYYYMMDD = httpShape.dateYYYYMMDD;
        this._setProfile();
        this._defaultWakeupTime = moment(this._dateYYYYMMDD).hour(7).minute(30).second(0).millisecond(0);
    }

    private _dateYYYYMMDD: string;
    private _defaultWakeupTime: moment.Moment;
    private _sleepProfileData: DaybookDayItemSleepProfileData;

    private _wakeupTimeIsSet: boolean;
    private _bedTimeIsSet: boolean;
    private _fallAsleepTimeIsSet: boolean;

    private _wakeupTime: moment.Moment;
    private _bedTime: moment.Moment;
    private _fallAsleepTime: moment.Moment;

    private _estimatedSleepDurationMinutes: number = -1;

    private _sleepProfileUpdated$: Subject<DaybookDayItemSleepProfileData> = new Subject();
    public saveChanges() { this._sleepProfileUpdated$.next(this.sleepProfileData); }
    public get sleepProfileUpdated$(): Observable<DaybookDayItemSleepProfileData> { return this._sleepProfileUpdated$.asObservable(); };


    public get sleepProfileData(): DaybookDayItemSleepProfileData { return this._sleepProfileData; }

    public get defaultWakeupTime(): moment.Moment { return this._defaultWakeupTime; }

    public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }
    public get bedTimeIsSet(): boolean { return this._bedTimeIsSet; }

    public get wakeupTime(): moment.Moment { return moment(this._wakeupTime); }
    public get bedTime(): moment.Moment { return moment(this._bedTime); }

    // public get estimatedSleepDurationMinutes(): number { return this._estimatedSleepDurationMinutes; }

    public get sleepQuality(): SleepQuality { return this.sleepProfileData.sleepQuality; }

    public setWakeupTime(wakeupTime: moment.Moment) {
        this._wakeupTime = moment(wakeupTime);
        this._wakeupTimeIsSet = true;
        this._sleepProfileData.wakeupTimeISO = this._wakeupTime.toISOString();
        this._sleepProfileData.wakeupTimeUtcOffsetMinutes = this._wakeupTime.utcOffset();
    }

    public setBedTime(bedTime: moment.Moment) {
        this._bedTime = moment(bedTime);
        this._bedTimeIsSet = true;
        this._sleepProfileData.bedtimeISO = this._bedTime.toISOString();
        this._sleepProfileData.bedtimeUtcOffsetMinutes = this._bedTime.utcOffset();
    }
    public setSleepQuality(quality: SleepQuality) {
        this._sleepProfileData.sleepQuality = quality;

    }


    private _setProfile() {
        if (this._sleepProfileData.wakeupTimeISO != null && this._sleepProfileData.wakeupTimeISO != '') {
            this._wakeupTimeIsSet = true;
            this._wakeupTime = moment(this._sleepProfileData.wakeupTimeISO);
        } else {
            this._wakeupTimeIsSet = false;
            this._wakeupTime = null;
        }
        if (this._sleepProfileData.bedtimeISO != null && this._sleepProfileData.bedtimeISO != '') {
            this._bedTimeIsSet = true;
            this._bedTime = moment(this._sleepProfileData.bedtimeISO);
        } else {
            this._bedTimeIsSet = false;
            this._bedTime = null;
        }
    }

}