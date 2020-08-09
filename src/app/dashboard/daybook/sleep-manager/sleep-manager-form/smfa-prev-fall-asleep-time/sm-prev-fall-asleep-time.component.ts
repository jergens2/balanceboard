import { Component, OnInit } from '@angular/core';
import { SleepService } from '../../sleep.service';
import * as moment from 'moment';
import { DurationString } from '../../../../../shared/time-utilities/duration-string.class';
import { TimelogEntryItem } from '../../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimelogEntryBuilder } from '../../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class';

@Component({
  selector: 'app-sm-prev-fall-asleep-time',
  templateUrl: './sm-prev-fall-asleep-time.component.html',
  styleUrls: ['./sm-prev-fall-asleep-time.component.css']
})
export class SmPrevFallAsleepTimeComponent implements OnInit {

  constructor(private sleepService: SleepService) { }

  private _fallAsleepTime: moment.Moment;
  private _maxVal: moment.Moment;
  private _minVal: moment.Moment;

  public get time(): moment.Moment { return this._fallAsleepTime; }

  private _wokeUpAt: moment.Moment;
  private _sleepDuration: string = '';
  public get wokeUpAt(): moment.Moment { return this._wokeUpAt; }
  public get sleepDuration(): string { return this._sleepDuration; }



  public get maxVal(): moment.Moment { return this._maxVal; }
  public get minVal(): moment.Moment { return this._minVal; }

  ngOnInit(): void {
    this._wokeUpAt = moment(this.sleepService.sleepManagerForm.formInputWakeupTime);
    if (this.sleepService.sleepManagerForm.prevFallAsleepTimeIsSet) {
      this._fallAsleepTime = moment(this.sleepService.sleepManagerForm.formInputPrevFallAsleep)
    } else {
      this._fallAsleepTime = moment(this.sleepService.sleepManager.previousFallAsleepTime);
    }
    this._setMinValue();
    this._setMaxValue();


    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this.wokeUpAt)
    this.onTimeChanged(this._fallAsleepTime);
  }





  onTimeChanged(time: moment.Moment) {
    // console.log("Time changed: " + time.format('hh:mm a'))
    this._fallAsleepTime = moment(time)
    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this.wokeUpAt)
    this.sleepService.sleepManagerForm.setformInputPrevFallAsleep(moment(time));
  }




  private _setMinValue() {
    let timelogEntries: TimelogEntryItem[] = [];
    const builder: TimelogEntryBuilder = new TimelogEntryBuilder();
    this.sleepService.sleepManager.dayItems.forEach(dayItem => {
      const dayTLEs = dayItem.timelogEntryDataItems.map(d => builder.buildFromDataItem(d));
      timelogEntries.concat(dayTLEs);
    });
    timelogEntries = timelogEntries.filter(item => item.endTime.isBefore(this._fallAsleepTime))
      .sort((t1, t2) => {
        if (t1.startTime.isAfter(t2.startTime)) { return -1; }
        else if (t1.startTime.isBefore(t2.startTime)) { return 1; }
        else { return 0; }
      });
    if (timelogEntries.length > 0) {
      const prevTLE: TimelogEntryItem = timelogEntries[0];
      this._minVal = moment(prevTLE.endTime);
    } else {
      this._minVal = moment(this.sleepService.sleepManager.defaultSleepTimeToday).subtract(36, 'hours');
    }
  }
  private _setMaxValue() {
    this._maxVal = moment(this._wokeUpAt).subtract(30, 'minutes');
  }

}
