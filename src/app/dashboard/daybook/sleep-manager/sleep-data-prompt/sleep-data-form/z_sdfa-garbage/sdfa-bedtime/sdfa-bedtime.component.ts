import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { SleepService } from '../../../../sleep.service';
import { DurationString } from '../../../../../../../shared/time-utilities/duration-string.class';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-sdfa-bedtime',
  templateUrl: './sdfa-bedtime.component.html',
  styleUrls: ['./sdfa-bedtime.component.css']
})
export class SdfaBedtimeComponent implements OnInit, OnDestroy {

  constructor(private sleepService: SleepService) { }

  private _durationFromNow: string = "";
  private _nextSleepDuration: string = "";
  public get durationFromNow(): string { return this._durationFromNow; }
  public get nextSleepDuration(): string { return this._nextSleepDuration; }
  
  private _timerSub: Subscription = new Subscription();

  private _bedtime: moment.Moment;
  private _nextWakeup: moment.Moment;
  
  public get bedtime(): moment.Moment { return this._bedtime; }
  public get nextWakeup(): moment.Moment { return this._nextWakeup; }

  public minBedtime: moment.Moment;
  public maxBedtime: moment.Moment;
  public minNextWakeup: moment.Moment;
  public maxNextWakeup: moment.Moment;


  ngOnInit(): void {
    this._bedtime = moment(this.sleepService.sleepManager.nextFallAsleepTime).subtract(20, 'minutes');
    this._nextWakeup = moment(this.sleepService.sleepManager.nextWakeupTime);


    this.minBedtime = moment(this.sleepService.sleepDataForm.formInputWakeupTime).add(1, 'hours');
    this.maxBedtime = moment(this.sleepService.sleepDataForm.formInputWakeupTime).add(23, 'hours');
    

    this._updateTimes();   
    this.sleepService.sleepDataForm.setformInputBedtime(moment(this._bedtime));
    this.sleepService.sleepDataForm.setformInputNextWakeup(moment(this._nextWakeup));

    this._timerSub = timer(0, 10000).subscribe((tick)=>{
      this._updateTimes();
    });
  }

  ngOnDestroy(){

  }

  public onBedtimeChanged(time: moment.Moment){
    this._bedtime = moment(time);
    this._updateTimes();
    this.sleepService.sleepDataForm.setformInputBedtime(moment(this._bedtime));
  }

  public onNextWakeupChanged(time: moment.Moment){
    this._nextWakeup = moment(time);
    this._updateTimes();
    this.sleepService.sleepDataForm.setformInputNextWakeup(moment(this._nextWakeup));
  }


  private _updateTimes(){
    this._durationFromNow = DurationString.calculateDurationString(moment(), this._bedtime, true) + " from now";
    this._nextSleepDuration = DurationString.calculateDurationString(moment(this._bedtime).add(20, 'minutes'), this._nextWakeup, true) + " target sleep duration";
  
  }
}
