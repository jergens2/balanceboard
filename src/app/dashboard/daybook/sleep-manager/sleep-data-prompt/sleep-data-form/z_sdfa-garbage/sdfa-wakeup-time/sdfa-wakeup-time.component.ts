import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DurationString } from '../../../../../../../shared/time-utilities/duration-string.class';
import { SleepService } from '../../../../sleep.service';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { timer } from 'rxjs';
import { UserAccountProfileService } from '../../../../../../user-account-profile/user-account-profile.service';

@Component({
  selector: 'app-sdfa-wakeup-time',
  templateUrl: './sdfa-wakeup-time.component.html',
  styleUrls: ['./sdfa-wakeup-time.component.css']
})
export class SdfaWakeupTimeComponent implements OnInit {

  constructor(private sleepService: SleepService) { }

  public faCheckCircle = faCheckCircle;
  private _saveClicked = false;
  private _durationAgo: string = "";
  private _date: string;

  private _sectionIsComplete: boolean = false;

  public get date(): string { return this._date; }
  // public get sectionIsComplete(): boolean { return this.sleepService.previousWakeTimeIsSet; }

  ngOnInit() {
    this._rebuild();
  }

  private _rebuild() {
    this.maxWakeupTime = moment().startOf('minute');
    if (this.sleepService.sleepDataForm.formInputWakeupTime) {
      this._time = moment(this.sleepService.sleepDataForm.formInputWakeupTime)
    } else {
      this._time = moment(this.sleepService.defaultWakeupTimeToday);
    }
    if (this._time.isAfter(this.maxWakeupTime)) {
      this._time = moment(this.maxWakeupTime);
    }
    timer(0, 60000).subscribe((tick) => {
      this._date = moment(this._time).format('dddd, MMM Do')
      this._calculateDurationString();
    });
    this.minWakeupTime = moment().subtract(23, 'hours');
    this.onTimeChanged(this._time);
  }


  private _time: moment.Moment;
  public get time(): moment.Moment { return this._time; };

  public minWakeupTime: moment.Moment;
  public maxWakeupTime: moment.Moment;

  public get durationAgo(): string {
    return this._durationAgo;
  }

  onTimeChanged(time: moment.Moment) {
    this._time = moment(time);
    this._calculateDurationString();
    this.sleepService.sleepDataForm.setformInputWakeupTime(moment(time));
  }

  public get isToday(): boolean { return true; }


  private _calculateDurationString() {
    let durationString: string = "";

    if (moment().isAfter(this.time)) {

      const minutes = moment().diff(this.time, 'minutes');
      if (minutes <= 2) {
        durationString = 'Just recently';
      } else if (minutes <= 5) {
        durationString = 'A few minutes ago';
      } else {
        durationString = DurationString.calculateDurationString(this.time, moment()) + " ago";
      }
    } else {
      console.log('error with clock time / wakeup time')
    }


    this._durationAgo = durationString;


  }




}
