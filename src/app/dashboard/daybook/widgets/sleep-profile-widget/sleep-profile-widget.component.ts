import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DaybookService } from '../../daybook.service';
import * as moment from 'moment';
import { SleepBatteryConfiguration } from '../sleep-battery/sleep-battery-configuration.interface';
import { faBed, faPlusCircle, faMinusCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-sleep-profile-widget',
  templateUrl: './sleep-profile-widget.component.html',
  styleUrls: ['./sleep-profile-widget.component.css']
})
export class SleepProfileWidgetComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }


  public sleepProfileForm: FormGroup;
  private _batteryConfiguration: SleepBatteryConfiguration;
  public get batteryConfiguration(): SleepBatteryConfiguration { return this._batteryConfiguration; }

  private _wakeupTime: moment.Moment;
  private _sleepAtTime: moment.Moment;

  public get wakeupTime(): string{
    if(this._wakeupTime){
      return this._wakeupTime.format('hh:mm a');
    }else{
      return " err";
    }
    
  }
  public get sleepAtTime(): string { 
    if(this._sleepAtTime){
      return this._sleepAtTime.format('hh:mm a');
    }else{
      return " err";
    }
  }



  ngOnInit() {
    this.reInitiate();
    this.daybookService.activeDayController$.subscribe((dayChanged) => { 
      this.reInitiate();
    });
  }

  public onWakeupTimeChanged(time: moment.Moment){

  }

  private reInitiate() {
    this._wakeupTime = this.daybookService.activeDayController.wakeupTime;
    this._sleepAtTime = this.daybookService.activeDayController.fallAsleepTime;
    // console.log("  SPW: This wakeup time is : " + this.wakeupTime);
    // console.log("  SPW: his.sleeptime is " + this.sleepAtTime)
    // console.log("  SPW: wakeup time: " + this.daybookService.activeDayController.wakeupTime.format('hh:mm a'))
    // console.log("  SPW: sleep time: " + this.daybookService.activeDayController.fallAsleepTime.format('hh:mm a'))
  }



}
