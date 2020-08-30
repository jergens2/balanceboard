import { Component, OnInit } from '@angular/core';
import { SleepService } from '../../../../sleep.service';
import * as moment from 'moment';
import { DurationString } from '../../../../../../../shared/time-utilities/duration-string.class';

@Component({
  selector: 'app-sdfa-sleep-duration',
  templateUrl: './sdfa-sleep-duration.component.html',
  styleUrls: ['./sdfa-sleep-duration.component.css']
})
export class SdfaSleepDurationComponent implements OnInit {

  constructor(private sleepService: SleepService) { }
  
  private _durationString: string = "";
  private _totalDuration: string = "";
  private _sleepPercent: number = 100;
  public get totalDuration(): string { return this._totalDuration; }
  public get sleepPercent(): number { return this._sleepPercent; }
  public get effectiveSleepDuration(): string { return this._durationString; }

  ngOnInit(): void {
    if(this.sleepService.sleepDataForm.durationIsSet){
      this._recalculateDuration(this.sleepService.sleepDataForm.formInputDurationPercent);
      this.onSliderValueChanged(this.sleepService.sleepDataForm.formInputDurationPercent);
    }else{
      this._recalculateDuration();
      this.onSliderValueChanged(100);
    }

  }

  public onSliderValueChanged(value: number) {
    this._sleepPercent = value;
    this._recalculateDuration(value);
    this.sleepService.sleepDataForm.setformInputDurationPercent(value);
  }


  private _recalculateDuration(percent: number = 100) {
    const sleepStart = moment(this.sleepService.sleepDataForm.formInputPrevFallAsleep);
    const sleepEnd = moment(this.sleepService.sleepDataForm.formInputWakeupTime);

    const durationMs = moment(sleepEnd).diff(sleepStart, 'milliseconds') * (percent / 100);
    const totalDuration =  moment(sleepEnd).diff(sleepStart, 'milliseconds');
    this._durationString = DurationString.getDurationStringFromMS(durationMs);
    this._totalDuration = DurationString.getDurationStringFromMS(totalDuration);
  }
}
