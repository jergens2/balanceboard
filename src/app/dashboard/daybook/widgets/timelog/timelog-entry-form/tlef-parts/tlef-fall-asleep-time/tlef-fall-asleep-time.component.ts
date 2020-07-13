import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { DaybookDisplayService } from '../../../../../daybook-display.service';


@Component({
  selector: 'app-tlef-fall-asleep-time',
  templateUrl: './tlef-fall-asleep-time.component.html',
  styleUrls: ['./tlef-fall-asleep-time.component.css']
})
export class TlefFallAsleepTimeComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }
  @Output() fallAsleepTimeChanged: EventEmitter<moment.Moment> = new EventEmitter();

  ngOnInit() {


    console.log("Min fall asleep time: " + this.minVal.format('YYYY-MM-DD hh:mm a'))
    console.log("Max fall asleep time: " + this.maxVal.format("YYYY-MM-DD hh:mm a"))
    
  }

  private _time: moment.Moment;
  public get time(): moment.Moment { return this._time; };

  public minVal: moment.Moment;
  public maxVal: moment.Moment;

  onTimeChanged(time: moment.Moment) {
    this._time = moment(time);
    this.fallAsleepTimeChanged.emit(this.time);
  }



}
