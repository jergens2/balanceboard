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
    private _sleepBeginsAfterStartOfDay: boolean = false;
    private _sleepBeginsBeforeEndOfDay: boolean = false;

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
    public get sleepBeginsAfterStartOfDay(): boolean { return this._sleepBeginsAfterStartOfDay; }
    public get sleepBeginsSameOrBeforeStartOfDay(): boolean { return !this._sleepBeginsAfterStartOfDay; }
    public get sleepBeginsBeforeEndOfDay(): boolean { return this._sleepBeginsBeforeEndOfDay; }
    public get sleepBeginsSameOrAfterEndOfDay(): boolean { return !this._sleepBeginsBeforeEndOfDay; }

    public get sleepQuality(): SleepQuality { return this.sleepProfileData.sleepQuality; }

    public get wakeupTimeOrDefault(): moment.Moment {
        let wakeupTime: moment.Moment;
        if (this.wakeupTimeIsSet) {
            wakeupTime = moment(this.wakeupTime);
        } else {
            wakeupTime = moment(this.defaultWakeupTime);
        }
        return wakeupTime;
    }
    public get previousFallAsleepTimeOrDefault(): moment.Moment { 
        let previousTime: moment.Moment;
        if(this.previousFallAsleepTimeIsSet){
            previousTime = moment(this.previousFallAsleepTime);
        }else{
            previousTime = moment(this.defaultPreviousFallAsleepTime);
        }
        return previousTime;
    }
    public get bedTimeOrDefault(): moment.Moment {
        let bedTime: moment.Moment;
        if (this.bedTimeIsSet) {
            bedTime = moment(this.bedTime);
        } else {
            bedTime = moment(this.defaultBedTime);
        }
        return bedTime;
    }
    public get fallAsleepTimeOrDefault(): moment.Moment {
        let fallAsleepTime: moment.Moment;
        if (this.fallAsleepTimeIsSet) {
            fallAsleepTime = moment(this.fallAsleepTime);
        } else {
            fallAsleepTime = moment(this.defaultFallAsleepTime);
        }
        return fallAsleepTime;
    }


    // public isSleepOrAwakeAtTime(timeToCheck: moment.Moment): "SLEEP" | "AWAKE" { 
    //     let isSleepOrAwake: "SLEEP" | "AWAKE" = "SLEEP";

    //     let currentTime: moment.Moment = moment(this._dateYYYYMMDD).startOf("day");

    //     let sections: {start: moment.Moment, end: moment.Moment, status: "SLEEP" | "AWAKE"}[] = [];

    //     // const startOfDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day");
    //     const endOfDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day").add(24, "hours");

    //     if(this.sleepBeginsAfterStartOfDay){
    //         sections.push({
    //             start: currentTime,
    //             end: this.previousFallAsleepTimeOrDefault,
    //             status: "AWAKE",
    //         });
    //         currentTime = moment(this.previousFallAsleepTimeOrDefault);

    //     }
    //     sections.push({
    //         start: currentTime,
    //         end: this.wakeupTimeOrDefault,
    //         status: "SLEEP" 
    //     });
    //     currentTime = moment(this.wakeupTimeOrDefault);
    //     sections.push({
    //         start: currentTime,
    //         end: moment(this.fallAsleepTimeOrDefault),
    //         status: "AWAKE"
    //     });
    //     currentTime = moment(this.fallAsleepTimeOrDefault);
    //     if(currentTime.isBefore(endOfDay)){
    //         sections.push({
    //             start: currentTime,
    //             end: moment(endOfDay),
    //             status: "SLEEP"
    //         });
    //     }

    //     // console.log("Sections: ")
    //     let sectionFound: boolean = false;
    //     sections.forEach((section)=>{
    //         // console.log("    " + section.start.format("YYYY-MM-DD hh:mm a") + " - " + section.end.format("YYYY-MM-DD hh:mm a") + "  -- " + section.status);
    //         if(timeToCheck.isSameOrAfter(section.start) && timeToCheck.isSameOrBefore(section.end)){
    //             sectionFound = true;
    //             isSleepOrAwake = section.status;
    //         }
    //     })
    //     if(!sectionFound){
    //         console.log("Error: no section found");
    //     }
    //     return isSleepOrAwake;
    // }



    public setPreviousFallAsleepTime(prevTime: moment.Moment) {
        this._previousFallAsleepTime = moment(prevTime);
        this._previousFallAsleepTimeIsSet = true;
        this._recalculate();
    }

    public setWakeupTime(wakeupTime: moment.Moment) {
        this._wakeupTime = moment(wakeupTime);
        this._wakeupTimeIsSet = true;
        this._sleepProfileData.wakeupTimeISO = this._wakeupTime.toISOString();
        this._sleepProfileData.wakeupTimeUtcOffsetMinutes = this._wakeupTime.utcOffset();
        this._recalculate();
        this._saveChanges();
    }

    public setBedTime(bedTime: moment.Moment) {
        this._bedTime = moment(bedTime);
        this._bedTimeIsSet = true;
        this._sleepProfileData.bedtimeISO = this._bedTime.toISOString();
        this._sleepProfileData.bedtimeUtcOffsetMinutes = this._bedTime.utcOffset();
        this._recalculate();
        this._saveChanges();
    }
    public setFallAsleepTime(fallAsleep: moment.Moment) {
        this._fallAsleepTime = moment(fallAsleep);
        this._fallAsleepTimeIsSet = true;
        this._sleepProfileData.fallAsleepTimeISO = this._fallAsleepTime.toISOString();
        this._sleepProfileData.fallAsleepTimeUtcOffsetMinutes = this._fallAsleepTime.utcOffset();
        this._recalculate();
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
        this._recalculate();
        this._defaultWakeupTime = moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultWakeupTime.hour()).minute(DaybookSleepProfile.defaultWakeupTime.minute()).startOf("minute");
        this._defaultBedtime = moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultBedtime.hour()).minute(DaybookSleepProfile.defaultBedtime.minute()).startOf("minute");
        this._defaultFallAsleepTime = moment(this._dateYYYYMMDD).hour(DaybookSleepProfile.defaultFallAsleepTime.hour()).minute(DaybookSleepProfile.defaultFallAsleepTime.minute()).startOf("minute");
        this._defaultPreviousFallAsleepTime = moment(this._defaultFallAsleepTime).subtract(1, "days");
    }
    private _recalculate() {
        if (this.wakeupTimeIsSet && this.previousFallAsleepTimeIsSet) {
            this._estimatedSleepDurationMinutes = moment(this.wakeupTime).diff(moment(this.previousFallAsleepTime), "minutes");
        } else if (this.wakeupTimeIsSet) {
            this._estimatedSleepDurationMinutes = moment(this.wakeupTime).diff((this.defaultPreviousFallAsleepTime), "minutes");
        } else {
            this._estimatedSleepDurationMinutes = -1;
        }

        let sleepBeginsAfterStartOfDay: boolean = false;
        const startOfDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day");
        if (this.previousFallAsleepTimeIsSet) {
            if (this.previousFallAsleepTime.isAfter(startOfDay)) {
                sleepBeginsAfterStartOfDay = true;
            }
        }
        let sleepBeginsBeforeEndOfDay: boolean = false;
        const endOfDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day").add(24, "hours");
        if (this.fallAsleepTimeIsSet) {
            if (this.fallAsleepTime.isBefore(endOfDay)) {
                sleepBeginsBeforeEndOfDay = true;
            }
        } else if (this.bedTimeIsSet) {
            if (this.bedTime.isBefore(endOfDay)) {
                sleepBeginsBeforeEndOfDay = true;
            }
        } else {
            sleepBeginsBeforeEndOfDay = true;
        }


        this._sleepBeginsAfterStartOfDay = sleepBeginsAfterStartOfDay;
        this._sleepBeginsBeforeEndOfDay = sleepBeginsBeforeEndOfDay;

    }
}