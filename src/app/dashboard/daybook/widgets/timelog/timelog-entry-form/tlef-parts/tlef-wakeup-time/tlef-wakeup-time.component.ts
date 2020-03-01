import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { DaybookControllerService } from '../../../../../controller/daybook-controller.service';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';

@Component({
  selector: 'app-tlef-wakeup-time',
  templateUrl: './tlef-wakeup-time.component.html',
  styleUrls: ['./tlef-wakeup-time.component.css']
})
export class TlefWakeupTimeComponent implements OnInit {

  /**
   * This form will only ever be used for NEW_CURRENT timelog entries, so at this point there is no need to consider dealing with other cases.
   */
  constructor(private daybookControllerService: DaybookControllerService) { }
  faSpinner = faSpinner;

  private _saveClicked = false;
  private _durationString: string = "";

  ngOnInit() {

    // console.log("Wakeup time is : " + this.daybookControllerService.activeDayController.wakeupTime.format('YYYY-MM-DD hh:mm a'))
    this._time = moment(this.daybookControllerService.activeDayController.wakeupTime);
    this.maxVal = moment(this.daybookControllerService.clock).startOf("minute");
    this.minVal = moment(this.daybookControllerService.todayController.prevDayFallAsleepTime).add(1, 'minutes');

    this._calculateDurationString();
    this.wakeupTimeChanged.emit(this.time);
  }

  @Output() wakeupTimeChanged: EventEmitter<moment.Moment> = new EventEmitter();

  private _time: moment.Moment;
  public get time(): moment.Moment { return this._time; };

  public minVal: moment.Moment;
  public maxVal: moment.Moment;
  public get saveClicked(): boolean { return this._saveClicked; }

  public get durationAgo(): string {
    return this._durationString;
  }

  onTimeChanged(time: moment.Moment) {
    this._time = moment(time);
    this._calculateDurationString();
    this.wakeupTimeChanged.emit(this.time);
  }


  private _calculateDurationString() {
    let durationString: string = "";

    if (this.daybookControllerService.clock.isAfter(this.time)) {

      const minutes = moment(this.daybookControllerService.clock).diff(this.time, 'minutes');
      if (minutes <= 2) {
        durationString = 'Just recently';
      } else if (minutes <= 5) { 
        durationString = 'A few minutes ago';
      }else {
        durationString = DurationString.calculateDurationString(this.time, this.daybookControllerService.clock) + " ago";
      }
    } else {
      console.log('error with clock time / wakeup time')
    }


    this._durationString = durationString;


  }



}
