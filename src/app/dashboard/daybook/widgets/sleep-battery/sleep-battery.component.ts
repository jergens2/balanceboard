import { Component, OnInit, Input } from '@angular/core';
import { timer } from 'rxjs';
import * as moment from 'moment';
import { DurationString } from '../timelog/timelog-entry-form/duration-string.class';

@Component({
  selector: 'app-sleep-battery',
  templateUrl: './sleep-battery.component.html',
  styleUrls: ['./sleep-battery.component.css']
})
export class SleepBatteryComponent implements OnInit {

  constructor() { }


  private _percentage: number = 0;


  private _wakeupTime: moment.Moment;
  private _bedtime: moment.Moment;
  @Input() public set wakeupTime(wakeupTime: moment.Moment){
    this._wakeupTime = moment(wakeupTime);
    if(this._bedtime && this._wakeupTime){
      this.updateBattery();
    }
  }
  @Input() public set bedtime(bedtime: moment.Moment){
    this._bedtime = moment(bedtime);
    if(this._bedtime && this._wakeupTime){
      this.updateBattery();
    }
  }
  public get wakeupTime(): moment.Moment{
    return this._wakeupTime;
  }
  public get bedtime(): moment.Moment{
    return this._bedtime;
  }


  percentageNgStyle: any = {};

  ngOnInit() {
    this.updateBattery();
    timer(0, 60000).subscribe((tick) => {
      this.updateBattery();
    });
  }


  private _timeUntilBedtime: string ="";
  private _timeSinceWakeup: string = "";

  public get timeSinceWakeup(): string {
    return this._timeSinceWakeup;
  }
  public get timeUntilBedtime(): string {
    return this._timeUntilBedtime;
  }

  private updateBattery() {
    let now: moment.Moment = moment();
    let awakeForMinutes: number = moment(now).diff(this.wakeupTime, "minutes");
    let totalDayDurationMinutes: number = moment(this.bedtime).diff(this.wakeupTime, "minutes");
    this._percentage = (1 - (awakeForMinutes / totalDayDurationMinutes)) * 100;

    let currentBatteryColor: string = "white";
    if (this._percentage < 25) {
      currentBatteryColor = "red";
    } else if (this._percentage >= 25 && this._percentage < 50) {
      currentBatteryColor = "orange";
    } else if (this._percentage >= 50 && this._percentage < 75) {
      currentBatteryColor = "yellow";
    } else if (this._percentage >= 75) {
      currentBatteryColor = "lime";
    }

    this.percentageNgStyle = {
      "background-color": currentBatteryColor,
      "height": "" + this._percentage.toFixed(2) + "%",
    }
    this._batteryCharge = "" + this._percentage.toFixed(0) + "%";


    let timeUntilBedtime = "";
    if (now.isBefore(this.bedtime)) {
        timeUntilBedtime = DurationString.calculateDurationString(now, this.bedtime, true) + " until bedtime";
    } else {
        timeUntilBedtime = DurationString.calculateDurationString(this.bedtime, now, true) + " past bedtime";
    }
    this._timeUntilBedtime = timeUntilBedtime;

    let timeSinceWakeup = "";
    if (now.isBefore(this.wakeupTime)) {
        timeSinceWakeup = "";
    } else if (now.isAfter(this.wakeupTime)) {
        timeSinceWakeup = DurationString.calculateDurationString(this.wakeupTime, now, true) + " since wake up";
    }
    this._timeSinceWakeup = timeSinceWakeup;


  }
  private _batteryCharge: string = "";
  public get batteryCharge(): string {
    return this._batteryCharge;
  }
}
