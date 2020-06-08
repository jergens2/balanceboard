import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DaybookControllerService } from '../../controller/daybook-controller.service';
import * as moment from 'moment';
import { SleepBatteryConfiguration } from '../sleep-battery/sleep-battery-configuration.interface';
import { faBed, faPlusCircle, faMinusCircle, faExclamationTriangle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { SleepManagerService } from '../../sleep-manager/sleep-manager.service';

@Component({
  selector: 'app-sleep-profile-widget',
  templateUrl: './sleep-profile-widget.component.html',
  styleUrls: ['./sleep-profile-widget.component.css']
})
export class SleepProfileWidgetComponent implements OnInit {

  constructor(private sleepService: SleepManagerService) { }

  faCircle = faCircle;
  public sleepProfileForm: FormGroup;
  private _batteryConfiguration: SleepBatteryConfiguration;
  public get batteryConfiguration(): SleepBatteryConfiguration { return this._batteryConfiguration; }

  private _wakeupTime: moment.Moment;
  private _sleepAtTime: moment.Moment;

  // public get wakeupTimeIsSet(): boolean { return this.daybookControllerService..wakeupTimeIsSet; }
  // public get fallAsleepTimeIsSet(): boolean { return this.daybookControllerService.activeDayController.fallAsleepTimeIsSet; }



  public get wakeupTime(): string {
    if (this._wakeupTime) {
      return this._wakeupTime.format('hh:mm a');
    } else {
      return " err";
    }

  }
  public get bedtime(): string {
    if (this._sleepAtTime) {
      return this._sleepAtTime.format('hh:mm a');
    } else {
      return " err";
    }
  }



  ngOnInit() {
    this.reInitiate();
    // this.daybookControllerService.activeDayController$.subscribe((dayChanged) => {
    //   if(dayChanged){
    //     this.reInitiate();
    //   }

    // });
  }

  public onWakeupTimeChanged(time: moment.Moment) {

  }

  private reInitiate() {
    this._wakeupTime = this.sleepService.sleepManager.previousWakeupTime;
    this._sleepAtTime = this.sleepService.sleepManager.nextFallAsleepTime;
    // console.log("  SPW: This wakeup time is : " + this.wakeupTime);
    // console.log("  SPW: his.sleeptime is " + this.sleepAtTime)
    // console.log("  SPW: wakeup time: " + this.daybookControllerService.activeDayController.wakeupTime.format('hh:mm a'))
    // console.log("  SPW: sleep time: " + this.daybookControllerService.activeDayController.fallAsleepTime.format('hh:mm a'))
  }



}
