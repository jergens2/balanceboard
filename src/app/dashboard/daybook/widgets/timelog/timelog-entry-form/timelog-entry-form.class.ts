import * as moment from 'moment';
import { timer } from 'rxjs';
import { DurationString } from './duration-string.class';

export class TimelogEntryForm {
    constructor() {


        timer(0, 1000).subscribe((tick) => {
            this._currentTime = moment();
        });
        timer(0, 60000).subscribe((tick) => {
            this.updateTimes();
        })
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
    public get bedtime(): moment.Moment{
        return moment(this._bedTime);
    }
    public get wakeupTime(): moment.Moment{
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
    
    public onClickSaveSleepTimes(wakeupTime: {hour: number, minute: number}, fallAsleepTime: {hour: number, minute: number}){
        console.log("boola woola", wakeupTime);
        console.log("ola bolw", fallAsleepTime);
        this._wakeupTime = moment(this._wakeupTime).hour(wakeupTime.hour).minute(wakeupTime.minute);
        this._lastNightFallAsleepTime = moment(this._lastNightFallAsleepTime).hour(fallAsleepTime.hour).minute(fallAsleepTime.minute);
        console.log("Warning:  this method does not account for fall asleep times which occurred after midnight (therefore this morning)")
        console.log("currently, it is assumed that you fell asleep yesterday, before midnight.  therefore any times past midnight will yield... incorrect results")
        this.updateTimes();
    }

    private _message: string = "";
    public get message(): string {
        return this._message;
    }



    // startTime: moment.Moment;
    // endTime: moment.Moment;

    // wakeUpSection: any;
    // bedtimeSection: any;


    private updateTimes() {

        if (this.currentTime.hour() < 12) {
            this._message = "Good morning";
        } else if (this.currentTime.hour() >= 12 && this.currentTime.hour() < 18) {
            this._message = "Good afternoon";
        } else if (this.currentTime.hour() >= 18) {
            this._message = "Good evening";
        }


        let timeUntilBedtime = "";
        if (this.currentTime.isBefore(this._bedTime)) {
            timeUntilBedtime = DurationString.calculateDurationString(this.currentTime, this._bedTime, true) + " until bedtime";
        } else {
            timeUntilBedtime = DurationString.calculateDurationString(this._bedTime, this.currentTime, true) + " past bedtime";
        }
        this._timeUntilBedtime = timeUntilBedtime;

        let timeSinceWakeup = "";
        if (this.currentTime.isBefore(this._wakeupTime)) {
            timeSinceWakeup = "";
        } else if (this.currentTime.isAfter(this._wakeupTime)) {
            timeSinceWakeup = DurationString.calculateDurationString(this._wakeupTime, this.currentTime, true) + " since wake up";
        }
        this._timeSinceWakeup = timeSinceWakeup;
    }

}