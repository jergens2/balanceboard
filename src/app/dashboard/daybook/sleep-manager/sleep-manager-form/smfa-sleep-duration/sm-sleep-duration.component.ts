import { Component, OnInit } from '@angular/core';
import { SleepManagerService } from '../../sleep-manager.service';
import * as moment from 'moment';
import { DurationString } from '../../../../../shared/utilities/time-utilities/duration-string.class';

@Component({
  selector: 'app-sm-sleep-duration',
  templateUrl: './sm-sleep-duration.component.html',
  styleUrls: ['./sm-sleep-duration.component.css']
})
export class SmSleepDurationComponent implements OnInit {

  constructor(private sleepService: SleepManagerService) { }
  private _durationString: string = "";
  public get durationString(): string { return this._durationString; }

  ngOnInit(): void {
 
    this._recalculateDuration();
  }

  public onSliderValueChanged(value: number){
    const percent = 100/value;
    this._recalculateDuration(percent);
  }


  private _recalculateDuration(percent: number = 1){
    const sleepStart = moment(this.sleepService.sleepManagerForm.formInputPrevFallAsleep);
    const sleepEnd = moment(this.sleepService.sleepManagerForm.formInputWakeupTime);
    
    const durationMs = moment(sleepEnd).diff(sleepStart, 'milliseconds') * (1/percent);
    this._durationString = DurationString.getDurationStringFromMS(durationMs);
  }
}
