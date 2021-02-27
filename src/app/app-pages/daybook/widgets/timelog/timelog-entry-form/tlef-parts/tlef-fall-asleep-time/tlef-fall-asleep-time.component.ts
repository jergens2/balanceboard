import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimeInput } from '../../../../../../../shared/components/time-input/time-input.class';


@Component({
  selector: 'app-tlef-fall-asleep-time',
  templateUrl: './tlef-fall-asleep-time.component.html',
  styleUrls: ['./tlef-fall-asleep-time.component.css']
})
export class TlefFallAsleepTimeComponent implements OnInit {

  private _time: moment.Moment;
  private _timeInput: TimeInput;

  constructor(private daybookService: DaybookDisplayService) { }
  @Output() fallAsleepTimeChanged: EventEmitter<moment.Moment> = new EventEmitter();

  ngOnInit() {

    console.log("This component is incomplete");
  }


  public get time(): moment.Moment { return this._time; };

  public minVal: moment.Moment;
  public maxVal: moment.Moment;

  onTimeChanged(time: moment.Moment) {
    this._time = moment(time);
    this.fallAsleepTimeChanged.emit(this.time);
  }



}
