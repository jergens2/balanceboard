import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DurationString } from '../../../../../shared/time-utilities/duration-string.class';
import { SleepService } from '../../../sleep-manager/sleep.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-sleep-profile-large',
  templateUrl: './sleep-profile-large.component.html',
  styleUrls: ['./sleep-profile-large.component.css']
})
export class SleepProfileLargeComponent implements OnInit {

  constructor(private sleepService: SleepService) { }

  private _bedtime: moment.Moment;

  public get wakeupTime(): moment.Moment { return this.sleepService.sleepManager.previousWakeupTime; }
  public get bedtime(): moment.Moment { return this._bedtime; }
  public get fallAsleepTime(): moment.Moment { return this.sleepService.sleepManager.nextFallAsleepTime;}
  public get prevDayFallAsleepTime(): moment.Moment{ return this.sleepService.sleepManager.previousFallAsleepTime; }
  public get currentEnergy(): number { return (100-this.sleepService.sleepManager.energyLevel); }

  public get awakeForString(): string {
    let now = moment();
    if(now.isBefore(this.wakeupTime)){
      return "Just woke up";
    }else{
      return DurationString.calculateDurationString(this.wakeupTime, now);
    }
  }

  public get timeUntilSleepString(): string { 
    let now = moment();
    if(now.isBefore(this.bedtime)){
      return DurationString.calculateDurationString(now, this.bedtime) + ' from now';
    }else{
      "It's time to go to sleep."
    }
  }
  
  ngOnInit() {
    
    this._updateBedtime();
    timer(0, 10000).subscribe((tick)=>{
      this._updateBedtime();
    });

  }

  private _updateBedtime(){
    this._bedtime = moment(this.fallAsleepTime).subtract(20, 'minutes');
    const currentMinute = this._bedtime.minute();
    this._bedtime = moment(this._bedtime).minute(currentMinute-(currentMinute%5));
  }



}
