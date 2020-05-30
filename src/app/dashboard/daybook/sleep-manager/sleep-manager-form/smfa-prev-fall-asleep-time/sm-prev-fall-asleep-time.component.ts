import { Component, OnInit } from '@angular/core';
import { SleepManagerService } from '../../sleep-manager.service';
import * as moment from 'moment';
import { DurationString } from '../../../../../shared/utilities/time-utilities/duration-string.class';

@Component({
  selector: 'app-sm-prev-fall-asleep-time',
  templateUrl: './sm-prev-fall-asleep-time.component.html',
  styleUrls: ['./sm-prev-fall-asleep-time.component.css']
})
export class SmPrevFallAsleepTimeComponent implements OnInit {

  constructor(private sleepService: SleepManagerService) { }

  private _fallAsleepTime: moment.Moment;
  public get time(): moment.Moment { return this._fallAsleepTime; }

  private _wokeUpAt: moment.Moment;
  private _sleepDuration: string = '';
  public get wokeUpAt(): moment.Moment { return this._wokeUpAt; }
  public get sleepDuration(): string { return this._sleepDuration; }

  public maxVal: moment.Moment;
  public minVal: moment.Moment;

  ngOnInit(): void {
    this._wokeUpAt = moment(this.sleepService.sleepManagerForm.formInputWakeupTime);
    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this.wokeUpAt)
    if (this.sleepService.sleepManagerForm.prevFallAsleepTimeIsSet) {
      this._fallAsleepTime = moment(this.sleepService.sleepManagerForm.formInputPrevFallAsleep)
    } else {
      this._fallAsleepTime = moment(this.sleepService.sleepManager.previousFallAsleepTime);
    }
    this.onTimeChanged(this._fallAsleepTime);
  }

  onTimeChanged(time: moment.Moment) {
    // console.log("Time changed: " + time.format('hh:mm a'))
    this._fallAsleepTime = moment(time)
    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this.wokeUpAt)
    this.sleepService.sleepManagerForm.setformInputPrevFallAsleep(moment(time));
  }



}
