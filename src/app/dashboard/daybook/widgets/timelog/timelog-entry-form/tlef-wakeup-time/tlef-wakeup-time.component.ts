import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { DaybookService } from '../../../../../daybook/daybook.service';

@Component({
  selector: 'app-tlef-wakeup-time',
  templateUrl: './tlef-wakeup-time.component.html',
  styleUrls: ['./tlef-wakeup-time.component.css']
})
export class TlefWakeupTimeComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  ngOnInit() {

    let initialTime: moment.Moment = this.daybookService.activeDayController.sleepController.firstWakeupTime;
    this._time = moment(initialTime);
    console.log("getting initial time: " + this._time.format('YYYY-MM-DD hh:mm a'))
  }

  @Output() timeChanged: EventEmitter<moment.Moment> = new EventEmitter();

  private _time: moment.Moment;
  public get time(): moment.Moment { return this._time; };

  public minVal: moment.Moment = moment().startOf("day");
  public maxVal: moment.Moment = moment().endOf("day");

  onTimeChanged(time: moment.Moment){
    console.log("wakeup time changed " + time.format("YYYY-MM-DD hh:mm a"))
    this._time = moment(time);
  }
  public onClickSave(){
    console.log("Saving time to sleepcontroller: " + this.time.format('YYYY-MM-DD hh:mm a'))
    this.daybookService.todayController.sleepController.setWakeupTimeForDay(this.time)
  }
}
