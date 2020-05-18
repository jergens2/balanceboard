import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DurationString } from '../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookControllerService } from '../../controller/daybook-controller.service';

@Component({
  selector: 'app-sm-wakeup-time',
  templateUrl: './sm-wakeup-time.component.html',
  styleUrls: ['./sm-wakeup-time.component.css']
})
export class SmWakeupTimeComponent implements OnInit {

  constructor(private daybookService: DaybookControllerService) { }

  private _saveClicked = false;
  private _durationAgo: string = "";
  private _date: string;

  public get date(): string { return this._date; }

  ngOnInit() {
    this._date = moment().format('dddd, MMM Do')
    // console.log("Wakeup time is : " + this.daybookControllerService.activeDayController.wakeupTime.format('YYYY-MM-DD hh:mm a'))
    // this._time = moment(this.daybookService.activeDayController.wakeupTime);
    this.maxVal = this.daybookService.activeDayController.getWakeupTimeMaxVal();
    this.minVal = this.daybookService.activeDayController.getWakeupTimeMinVal();

    console.log("Min and max val:  " + this.minVal.format('YYYY-MM-DD hh:mm a') + " to  " + this.maxVal.format('YYYY-MM-DD hh:mm a'))

    this._calculateDurationString();
    // this.wakeupTimeChanged.emit(this.time);
  }


  private _time: moment.Moment;
  public get time(): moment.Moment { return this._time; };

  public minVal: moment.Moment;
  public maxVal: moment.Moment;

  public get durationAgo(): string {
    return this._durationAgo;
  }

  onTimeChanged(time: moment.Moment) {
    this._time = moment(time);
    this._calculateDurationString();
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
      }else {
        durationString = DurationString.calculateDurationString(this.time, moment()) + " ago";
      }
    } else {
      console.log('error with clock time / wakeup time')
    }


    this._durationAgo = durationString;


  }




}
