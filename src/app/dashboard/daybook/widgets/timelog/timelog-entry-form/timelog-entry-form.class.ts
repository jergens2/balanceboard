import * as moment from 'moment';
import { timer } from 'rxjs';
import { DurationString } from '../../../../../shared/utilities/duration-string.class';
import { SleepBatteryConfiguration } from '../../sleep-battery/sleep-battery-configuration.interface';
import { SleepQuality } from './form-sections/sleep-section/sleep-quality.enum';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { DaybookDayItemSleepProfile } from '../../../api/data-items/daybook-day-item-sleep-profile.interface';

export class TimelogEntryForm {

    private userName: string = "Jeremy";

    private activeDay: DaybookDayItem;

    constructor(activeDay: DaybookDayItem) {
        this.activeDay = activeDay;
        this.setParameters();
        this.updateTimes();
        timer(0, 1000).subscribe((tick) => {
            this._currentTime = moment();
            if (this.currentTime.hour() < 12) {
                this._message = "Good morning " + this.userName;
            } else if (this.currentTime.hour() >= 12 && this.currentTime.hour() < 18) {
                this._message = "Good afternoon " + this.userName;
            } else if (this.currentTime.hour() >= 18) {
                this._message = "Good evening " + this.userName;
            }
        });
        timer(0, 60000).subscribe((tick) => {
            this.updateTimes();
        })
    }

    private setParameters(){
        if(this.activeDay.sleepProfile.bedtimeISO){
            console.log("Setting bed time to: ", this.activeDay.sleepProfile.bedtimeISO)
            this._bedTime = moment(this.activeDay.sleepProfile.bedtimeISO);
        }
        if(this.activeDay.sleepProfile.previousFallAsleepTimeISO){
            console.log("setting fall asleep time to: ", this.activeDay.sleepProfile.previousFallAsleepTimeISO)
            this._lastNightFallAsleepTime = moment(this.activeDay.sleepProfile.previousFallAsleepTimeISO);
        }
        if(this.activeDay.sleepProfile.wakeupTimeISO){
            console.log("setting wakeup time: ", this.activeDay.sleepProfile.wakeupTimeISO);
            this._wakeupTime = moment(this.activeDay.sleepProfile.wakeupTimeISO);
        }
        this._sleepQuality = this.activeDay.sleepProfile.sleepQuality;
    }       

    public updateActiveDay(activeDay: DaybookDayItem){
        this.activeDay = activeDay;
    }

    private _message: string = "";
    public get message(): string {
        return this._message;
    }

    private _currentTime = moment();
    public get currentTime(): moment.Moment {
        return moment(this._currentTime);
    }

    private _bedTime: moment.Moment = moment().hour(22).minute(30).second(0).millisecond(0);
    private _timeUntilBedtime: string = "";
    public get timeUntilBedtime(): string {
        return this._timeUntilBedtime;
    }
    public get bedtime(): moment.Moment {
        return moment(this._bedTime);
    }
    public get wakeupTime(): moment.Moment {
        return moment(this._wakeupTime);
    }

    private _wakeupTime: moment.Moment = moment().hour(7).minute(0).second(0).millisecond(0);
    private _timeSinceWakeup: string = "";
    public get timeSinceWakeup(): string {
        return this._timeSinceWakeup;
    }
    public get wakeupTimeHHmm(): string {
        return this._wakeupTime.format("HH:mm");
    }
    private _lastNightFallAsleepTime: moment.Moment = moment(this._bedTime).subtract(1, "days");
    public get lastNightFallAsleepTimeHHmm(): string {
        return this._lastNightFallAsleepTime.format("HH:mm");
    }
    public get lastNightFallAsleepTime(): moment.Moment {
        return moment(this._lastNightFallAsleepTime);
    }


    public onClickBanner(bannerName: string) {
        if (bannerName == "SLEEP_SECTION") {
            this.sleepSectionExpanded = true;
            this._batteryConfiguration["shape"] = "LARGE";
        }
    }

    public onClickSaveSleepTimes(sleepProfile: DaybookDayItemSleepProfile) {
        this._wakeupTime = moment(sleepProfile.wakeupTimeISO);
        this._lastNightFallAsleepTime = moment(sleepProfile.previousFallAsleepTimeISO);
        this.updateTimes();
        this.sleepSectionExpanded = false;
        this.activeDay.sleepProfile = sleepProfile
    }


    sleepSectionExpanded: boolean = false;
    morningRoutineSectionExpanded: boolean = false;
    eveningRoutineSectionExpanded: boolean = false;


    private _sleepQuality: SleepQuality = SleepQuality.Okay;
    public set sleepQuality(sleepQuality: SleepQuality){
        this._sleepQuality = sleepQuality;
    }
    public get sleepQuality(): SleepQuality{
        return this._sleepQuality;
    }
    public get sleepDuration(): string{
        return DurationString.calculateDurationString(this.lastNightFallAsleepTime, this.wakeupTime);
    }
    public get sleepDurationShort(): string{
        return DurationString.calculateDurationString(this.lastNightFallAsleepTime, this.wakeupTime, true);
    }





    private updateTimes() {

        if (this.currentTime.hour() < 12) {
            this._message = "Good morning " + this.userName;
        } else if (this.currentTime.hour() >= 12 && this.currentTime.hour() < 18) {
            this._message = "Good afternoon " + this.userName;
        } else if (this.currentTime.hour() >= 18) {
            this._message = "Good evening " + this.userName;
        }


        let timeUntilBedtime = "";
        if (this.currentTime.isBefore(this._bedTime)) {
            timeUntilBedtime = DurationString.calculateDurationString(this.currentTime, this._bedTime, true) + " remaining";
        } else {
            timeUntilBedtime = DurationString.calculateDurationString(this._bedTime, this.currentTime, true) + " past pedtime";
        }
        this._timeUntilBedtime = timeUntilBedtime;

        let timeSinceWakeup = "";
        if (this.currentTime.isBefore(this._wakeupTime)) {
            timeSinceWakeup = "";
        } else if (this.currentTime.isAfter(this._wakeupTime)) {
            timeSinceWakeup = DurationString.calculateDurationString(this._wakeupTime, this.currentTime, true);
        }
        this._timeSinceWakeup = timeSinceWakeup;
        this.updateBatteryConfiguration();
    }

    private updateBatteryConfiguration() {
        let batteryConfiguration: SleepBatteryConfiguration = {
            wakeupTime: this.wakeupTime,
            bedtime: this.bedtime,
        }
        this._batteryConfiguration = batteryConfiguration;
    }

    private _batteryConfiguration: SleepBatteryConfiguration = null;
    public get batteryConfiguration(): SleepBatteryConfiguration {
        return this._batteryConfiguration;
    }

}