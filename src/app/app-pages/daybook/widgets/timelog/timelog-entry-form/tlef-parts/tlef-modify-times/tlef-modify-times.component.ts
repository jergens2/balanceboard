import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { DurationString } from '../../../../../../../shared/time-utilities/duration-string.class';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimeInput } from '../../../../../../../shared/components/time-input/time-input.class';

@Component({
  selector: 'app-tlef-modify-times',
  templateUrl: './tlef-modify-times.component.html',
  styleUrls: ['./tlef-modify-times.component.css']
})
export class TlefModifyTimesComponent implements OnInit {

  constructor() { }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _startTimeInput: TimeInput;
  private _endTimeInput: TimeInput;

  @Input() public entryItem: TimelogEntryItem;
  @Input() public startTimeBoundary: moment.Moment;
  @Input() public endTimeBoundary: moment.Moment;


  @Output() timesModified: EventEmitter<{ startTime: moment.Moment, endTime: moment.Moment }> = new EventEmitter();

  public get startTime(): moment.Moment { return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }
  public get startTimeInput(): TimeInput { return this._startTimeInput; }
  public get endTimeInput(): TimeInput { return this._endTimeInput; }

  ngOnInit() {

    this._startTime = moment(this.entryItem.startTime);
    this._endTime = moment(this.entryItem.endTime);
    console.log("WARNING: INCOMPLETE");
    this._startTimeInput = new TimeInput(this._startTime, null, null);
    this._startTimeInput.configure(true, false, true, 1);
    this._endTimeInput = new TimeInput(this._startTime, null, null);
    this._endTimeInput.configure(true, false, true, 1);
    this._startTimeInput.timeValue$.subscribe(time => {
      this._startTime = moment(time);
      this.updateTimes();
    });
    this._endTimeInput.timeValue$.subscribe(time => {
      this._endTime = moment(time);
      this.updateTimes();
    });
    this.updateTimes();
  }




  public minValStart: moment.Moment;
  public maxValStart: moment.Moment;
  public minValEnd: moment.Moment;
  public maxValEnd: moment.Moment;



  public onEndTimeChanged(time: moment.Moment) {
    this._endTime = moment(time);
    this.updateTimes();
  }
  public onStartTimeChanged(time: moment.Moment) {
    this._startTime = moment(time);
    this.updateTimes();
  }

  public updateTimes() {

    this._durationString = DurationString.calculateDurationString(this.startTime, this.endTime);

  }


  private _durationString: string = ""
  public get durationString(): string { return this._durationString; };



  public onClickSaveTimes() {
    this.timesModified.emit({
      startTime: this._startTime,
      endTime: this._endTime,
    });
  }

}
