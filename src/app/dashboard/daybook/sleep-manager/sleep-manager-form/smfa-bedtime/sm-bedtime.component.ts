import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { SleepManagerService } from '../../sleep-manager.service';
import { DurationString } from '../../../../../shared/utilities/time-utilities/duration-string.class';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-sm-bedtime',
  templateUrl: './sm-bedtime.component.html',
  styleUrls: ['./sm-bedtime.component.css']
})
export class SmBedtimeComponent implements OnInit, OnDestroy {

  constructor(private sleepService: SleepManagerService) { }

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
    this._bedtime = moment(this.sleepService.nextFallAsleepTime).subtract(20, 'minutes');
    this._nextWakeup = moment(this.sleepService.nextWakeupTime);


    this.minBedtime = moment(this.sleepService.sleepManagerForm.formInputWakeupTime).add(1, 'hours');
    this.maxBedtime = moment(this.sleepService.sleepManagerForm.formInputWakeupTime).add(23, 'hours');
    

    this._updateTimes();   
    this.sleepService.sleepManagerForm.setformInputBedtime(moment(this._bedtime));
    this.sleepService.sleepManagerForm.setformInputNextWakeup(moment(this._nextWakeup));

    this._timerSub = timer(0, 10000).subscribe((tick)=>{
      this._updateTimes();
    });
  }

  ngOnDestroy(){

  }

  public onBedtimeChanged(time: moment.Moment){
    this._bedtime = moment(time);
    this._updateTimes();
    this.sleepService.sleepManagerForm.setformInputBedtime(moment(this._bedtime));
  }

  public onNextWakeupChanged(time: moment.Moment){
    this._nextWakeup = moment(time);
    this._updateTimes();
    this.sleepService.sleepManagerForm.setformInputNextWakeup(moment(this._nextWakeup));
  }


  private _updateTimes(){
    this._durationFromNow = DurationString.calculateDurationString(moment(), this._bedtime, true) + " from now";
    this._nextSleepDuration = DurationString.calculateDurationString(moment(this._bedtime).add(20, 'minutes'), this._nextWakeup, true) + " target sleep duration";
  
  }
}
