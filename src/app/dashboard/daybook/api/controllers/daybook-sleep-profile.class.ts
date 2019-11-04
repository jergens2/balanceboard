import { DaybookDayItemSleepProfileData } from "../data-items/daybook-day-item-sleep-profile-data.interface";
import * as moment from 'moment';
import { Observable, Subject } from "rxjs";
import { SleepQuality } from "../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum";

export class DaybookSleepProfile{


    static readonly defaultWakeupTime: moment.Moment = moment().hour(7).minute(30).second(0).millisecond(0);
    static readonly defaultBedtime: moment.Moment = moment().hour(22).minute(30).second(0).millisecond(0);
    static readonly defaultPreviousFallAsleepTime: moment.Moment = moment(DaybookSleepProfile.defaultBedtime).subtract(1, "days");
    static readonly defaultFallAsleepTime: moment.Moment = moment(DaybookSleepProfile.defaultBedtime);


    constructor(sleepProfile: DaybookDayItemSleepProfileData, dateYYYYMMDD: string){
        this._sleepProfileData = sleepProfile;
        this._dateYYYYMMDD = dateYYYYMMDD;
    }

    public updateSleepProfile(profileData: DaybookDayItemSleepProfileData){
        this._sleepProfileData = profileData;
        this.update();
        this.saveChanges();
    }

    private update(){
        console.log("Not implemented");
    }
    private saveChanges(){

        this._sleepProfileUpdated$.next(this.sleepProfileData);

    }
    
    
    
    
    private _dateYYYYMMDD: string;
    private _sleepProfileData: DaybookDayItemSleepProfileData;

    public get sleepProfileData(): DaybookDayItemSleepProfileData { return this._sleepProfileData; }
    public get sleepQuality(): SleepQuality { return this.sleepProfileData.sleepQuality; }

    private _sleepProfileUpdated$: Subject<DaybookDayItemSleepProfileData> = new Subject();
    public get sleepProfileUpdated$(): Observable<DaybookDayItemSleepProfileData> { return this._sleepProfileUpdated$.asObservable(); };

    public get sleepProfileIsSet(): boolean {
        return this._sleepProfileData.bedtimeISO != "" && this._sleepProfileData.previousFallAsleepTimeISO != "" && this._sleepProfileData.wakeupTimeISO != "";
    }
    public get wakeupTimeIsSet(): boolean {
        return this._sleepProfileData.wakeupTimeISO != "" && this._sleepProfileData.wakeupTimeISO != null;
    }
    public get bedTimeIsSet(): boolean {
        return this._sleepProfileData.bedtimeISO != "" && this._sleepProfileData.bedtimeISO != null;
    }
    
    public get wakeupTime(): moment.Moment {
        if (this._sleepProfileData != null) {
            if (!(this._sleepProfileData.wakeupTimeISO == null || this._sleepProfileData.wakeupTimeISO == "")) {
                return moment(this._sleepProfileData.wakeupTimeISO);
            }
        }
        // console.log("Returning default wakeupTime value");
        return moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultWakeupTime.hour()).minute(DaybookSleepProfile.defaultWakeupTime.minute()).second(0).millisecond(0);
    }
    public get bedtime(): moment.Moment {
        if (this._sleepProfileData != null) {
            if (!(this._sleepProfileData.bedtimeISO == null || this._sleepProfileData.bedtimeISO == "")) {
                return moment(this._sleepProfileData.bedtimeISO);
            }
        }
        // console.log("Returning default wakeupTime value");
        return moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultBedtime.hour()).minute(DaybookSleepProfile.defaultBedtime.minute()).second(0).millisecond(0);

    }
    public get fallAsleepTime(): moment.Moment {
        if (this._sleepProfileData != null) {
            if (!(this._sleepProfileData.fallAsleepTimeISO == null || this._sleepProfileData.fallAsleepTimeISO == "")) {
                return moment(this._sleepProfileData.fallAsleepTimeISO);
            }
        }
        // console.log("Returning default wakeupTime value");
        // as of now, the fall asleep time and bed time will be the same value, even though ultimately i would like to distinguish between the 2 variables to get a more accurate sleep profile.
        return moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultFallAsleepTime.hour()).minute(DaybookSleepProfile.defaultFallAsleepTime.minute()).second(0).millisecond(0);
    }
    public get previousFallAsleepTime(): moment.Moment {
        if (this._sleepProfileData != null) {
            if (!(this._sleepProfileData.previousFallAsleepTimeISO == null || this._sleepProfileData.previousFallAsleepTimeISO == "")) {
                return moment(this._sleepProfileData.previousFallAsleepTimeISO);
            }
        }
        // console.log("Returning default wakeupTime value");
        // as of now, the fall asleep time and bed time will be the same value, even though ultimately i would like to distinguish between the 2 variables to get a more accurate sleep profile.
        return moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultPreviousFallAsleepTime.hour()).minute(DaybookSleepProfile.defaultPreviousFallAsleepTime.minute()).second(0).millisecond(0);

    }

}