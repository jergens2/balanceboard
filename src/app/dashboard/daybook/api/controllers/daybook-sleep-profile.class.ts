import { DaybookDayItemSleepProfileData } from "../data-items/daybook-day-item-sleep-profile-data.interface";
import * as moment from 'moment';
import { Observable, Subject } from "rxjs";
import { SleepQuality } from "../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum";
import { DaybookDayItemHttpShape } from "../daybook-day-item-http-shape.interface";

export class DaybookSleepProfile {
    static readonly defaultWakeupTime: moment.Moment = moment().hour(7).minute(30).second(0).millisecond(0);
    static readonly defaultBedtime: moment.Moment = moment().hour(22).minute(30).second(0).millisecond(0);
    static readonly defaultFallAsleepTime: moment.Moment = moment().hour(23).minute(0).second(0).millisecond(0);

    constructor(httpShape: DaybookDayItemHttpShape) {
        this._sleepProfileData = httpShape.sleepProfile;
        this._dateYYYYMMDD = httpShape.dateYYYYMMDD;
        this._setProfile();
    }


    private _sleepProfileUpdated$: Subject<DaybookDayItemSleepProfileData> = new Subject();
    private _saveChanges() { this._sleepProfileUpdated$.next(this.sleepProfileData); }
    public get sleepProfileUpdated$(): Observable<DaybookDayItemSleepProfileData> { return this._sleepProfileUpdated$.asObservable(); };



    private _dateYYYYMMDD: string;
    private _sleepProfileData: DaybookDayItemSleepProfileData;

    private _defaultWakeupTime: moment.Moment;
    private _defaultBedtime: moment.Moment;
    private _defaultPreviousFallAsleepTime: moment.Moment;
    private _defaultFallAsleepTime: moment.Moment;

    private _wakeupTimeIsSet: boolean = false;
    private _previousFallAsleepTimeIsSet: boolean = false;
    private _bedTimeIsSet: boolean = false;
    private _fallAsleepTimeIsSet: boolean = false;

    private _wakeupTime: moment.Moment;
    private _previousFallAsleepTime: moment.Moment;
    private _bedTime: moment.Moment;
    private _fallAsleepTime: moment.Moment;

    private _estimatedSleepDurationMinutes: number = -1;


    public get sleepProfileData(): DaybookDayItemSleepProfileData { return this._sleepProfileData; }

    public get defaultWakeupTime(): moment.Moment { return this._defaultWakeupTime; }
    public get defaultBedTime(): moment.Moment { return this._defaultBedtime; }
    public get defaultPreviousFallAsleepTime(): moment.Moment { return this._defaultPreviousFallAsleepTime; }
    public get defaultFallAsleepTime(): moment.Moment { return this._defaultFallAsleepTime; }

    public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }
    public get previousFallAsleepTimeIsSet(): boolean { return this._previousFallAsleepTimeIsSet; }
    public get bedTimeIsSet(): boolean { return this._bedTimeIsSet; }
    public get fallAsleepTimeIsSet(): boolean { return this._fallAsleepTimeIsSet; }

    public get wakeupTime(): moment.Moment { return moment(this._wakeupTime); }
    public get previousFallAsleepTime(): moment.Moment { return moment(this._previousFallAsleepTime); }
    public get bedTime(): moment.Moment { return moment(this._bedTime); }
    public get fallAsleepTime(): moment.Moment { return moment(this._fallAsleepTime); }

    public get estimatedSleepDurationMinutes(): number { return this._estimatedSleepDurationMinutes; }

    public get sleepQuality(): SleepQuality { return this.sleepProfileData.sleepQuality; }


    public setWakeupTime(wakeupTime: moment.Moment) {
        this._wakeupTime = moment(wakeupTime);
        this._wakeupTimeIsSet = true;
        this._sleepProfileData.wakeupTimeISO = this._wakeupTime.toISOString();
        this._sleepProfileData.wakeupTimeUtcOffsetMinutes = this._wakeupTime.utcOffset();
        this._updateDurationEstimate();
        this._saveChanges();
    }
    public setPreviousFallAsleepTime(prevTime: moment.Moment) {
        this._previousFallAsleepTime = moment(prevTime);
        this._previousFallAsleepTimeIsSet = true;
        this._sleepProfileData.previousFallAsleepTimeISO = this._previousFallAsleepTime.toISOString();
        this._sleepProfileData.previousFallAsleepTimeUtcOffsetMinutes = this._previousFallAsleepTime.utcOffset();
        this._updateDurationEstimate();
        this._saveChanges();
    }
    public setBedTime(bedTime: moment.Moment) {
        this._bedTime = moment(bedTime);
        this._bedTimeIsSet = true;
        this._sleepProfileData.bedtimeISO = this._bedTime.toISOString();
        this._sleepProfileData.bedtimeUtcOffsetMinutes = this._bedTime.utcOffset();
        this._updateDurationEstimate();
        this._saveChanges();
    }
    public setFallAsleepTime(fallAsleep: moment.Moment) {
        this._fallAsleepTime = moment(fallAsleep);
        this._fallAsleepTimeIsSet = true;
        this._sleepProfileData.fallAsleepTimeISO = this._fallAsleepTime.toISOString();
        this._sleepProfileData.fallAsleepTimeUtcOffsetMinutes = this._fallAsleepTime.utcOffset();
        this._updateDurationEstimate();
        this._saveChanges();
    }
    public setSleepQuality(quality: SleepQuality) {
        this._sleepProfileData.sleepQuality = quality;
        this._saveChanges();
    }
    public updateFullSleepProfile(profileData: DaybookDayItemSleepProfileData) {
        this._sleepProfileData = profileData;
        this._setProfile();
        this._saveChanges();
    }

    private _setProfile() {
        if (this._sleepProfileData.previousFallAsleepTimeISO != null && this._sleepProfileData.previousFallAsleepTimeISO != "") {
            this._previousFallAsleepTimeIsSet = true;
            this._previousFallAsleepTime = moment(this._sleepProfileData.previousFallAsleepTimeISO);
        } else {
            this._previousFallAsleepTimeIsSet = false;
            this._previousFallAsleepTime = null;
        }
        if (this._sleepProfileData.wakeupTimeISO != null && this._sleepProfileData.wakeupTimeISO != "") {
            this._wakeupTimeIsSet = true
            this._wakeupTime = moment(this._sleepProfileData.wakeupTimeISO);
        } else {
            this._wakeupTimeIsSet = false;
            this._wakeupTime = null;
        }
        if (this._sleepProfileData.bedtimeISO != null && this._sleepProfileData.bedtimeISO != "") {
            this._bedTimeIsSet = true;
            this._bedTime = moment(this._sleepProfileData.bedtimeISO);
        } else {
            this._bedTimeIsSet = false;
            this._bedTime = null;
        }
        if (this._sleepProfileData.fallAsleepTimeISO != null && this._sleepProfileData.fallAsleepTimeISO != "") {
            this._fallAsleepTimeIsSet = true;
            this._fallAsleepTime = moment(this._fallAsleepTime);
        } else {
            this._fallAsleepTimeIsSet = false;
            this._fallAsleepTime = null;
        }
        this._updateDurationEstimate();
        this._defaultWakeupTime = moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultWakeupTime.hour()).minute(DaybookSleepProfile.defaultWakeupTime.minute()).startOf("minute");
        this._defaultBedtime = moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultBedtime.hour()).minute(DaybookSleepProfile.defaultBedtime.minute()).startOf("minute");
        this._defaultFallAsleepTime = moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultFallAsleepTime.hour()).minute(DaybookSleepProfile.defaultFallAsleepTime.minute()).startOf("minute");
        this._defaultPreviousFallAsleepTime = moment(this._defaultFallAsleepTime).subtract(1, "days");
    }
    private _updateDurationEstimate() {
        if (this.wakeupTimeIsSet && this.previousFallAsleepTimeIsSet) {
            this._estimatedSleepDurationMinutes = moment(this.wakeupTime).diff(moment(this.previousFallAsleepTime), "minutes");
            this._sleepProfileData.estimatedSleepDurationMinutes = this._estimatedSleepDurationMinutes;
        } else if (this.wakeupTimeIsSet && this.bedTimeIsSet) {
            const sleepPercentage: number = 95;
            this._estimatedSleepDurationMinutes = (moment(this.wakeupTime).diff(moment(this.bedTime), "minutes")) * (sleepPercentage / 100);
            this._sleepProfileData.estimatedSleepDurationMinutes = this._estimatedSleepDurationMinutes;
        } else if( this.wakeupTimeIsSet){
            this._estimatedSleepDurationMinutes = moment(this.wakeupTime).diff(this._defaultFallAsleepTime, "minutes");
            this._sleepProfileData.estimatedSleepDurationMinutes = this._estimatedSleepDurationMinutes;
        }else{
            this._estimatedSleepDurationMinutes = -1;
        }
    }
}