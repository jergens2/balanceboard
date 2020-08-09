import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
// import { SleepQuality } from '../../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum';

@Component({
  selector: 'app-sleep-profile-form',
  templateUrl: './sleep-profile-form.component.html',
  styleUrls: ['./sleep-profile-form.component.css']
})
export class SleepProfileFormComponent implements OnInit {

  faExclamationTriangle = faExclamationTriangle;

  constructor() { }

  // public wakeupTime: moment.Moment;
  // public wakeupTimeMin: moment.Moment;
  // public wakeupTimeMax: moment.Moment;


  // public bedTime: moment.Moment;
  // public bedTimeMin: moment.Moment;
  // public bedTimeMax: moment.Moment;

  public isEditingWakeupTime: boolean = false;
  public isEditingBedTime: boolean = false;

  // public sleepQuality: SleepQuality;
  // public get sleepQuality(): SleepQuality { return this._sleepQuality; }

  // public sleepQualityBeds: SleepQuality[] = [
  //   SleepQuality.VeryPoor,
  //   SleepQuality.Poor,
  //   SleepQuality.Okay,
  //   SleepQuality.Well,
  //   SleepQuality.VeryWell,
  // ];

  // public get sleepTimesSet(): boolean { return this.daybookControllerService.activeDayController.sleepController.wakeupTimeIsSet; }
  // public get wakeupTimeIsSet(): boolean { return this.daybookControllerService.activeDay.timeReferencer.thisDayWakeupTime.isSet; }
  // public get bedTimeIsSet(): boolean { return this.daybookControllerService.activeDay.timeReferencer.thisDayBedTime.isSet; }
  // public get previousBedTimeIsSet(): boolean { return this.daybookControllerService.activeDay.timeReferencer.previousDayBedTime.isSet; }
  // public get previousBedTime(): moment.Moment { return this.daybookControllerService.activeDay.timeReferencer.previousDayBedTime.startTime; }

  ngOnInit() {
    this.reInitiate();

  }


  private reInitiate() {







    // this.sleepQuality = this.daybookControllerService.activeDay.sleepProfile.sleepQuality;

    // console.log("REINITIATE:  SLeep profile: :: : : :")
    // console.log(" this wakeup time:  " + this.wakeupTime.format("YYYY-MM-DD hh:mm a"))
    // console.log(" this bed time:  " + this.bedTime.format("YYYY-MM-DD hh:mm a"))

    // console.log(" Wake up time is set? " + this.wakeupTimeIsSet)
    // console.log(" bed time is set ? " + this.bedTimeIsSet)

    // if (this.bedTimeIsSet) {
    //   this.isEditingBedTime = false;
    // } else {
    //   this.isEditingBedTime = true;
    // }
    // if (this.wakeupTimeIsSet) {
    //   this.isEditingWakeupTime = false;
    // } else {
    //   this.isEditingWakeupTime = true;
    // }
  }

  public onClickSaveSleepProfile() {

    console.log('TO IMPLEMENT:')

    this.isEditingBedTime = false;
    this.isEditingWakeupTime = false;
  }

  public onWakeupTimeChanged(time: moment.Moment) {
    console.log('TO IMPLEMENT')

  }

  public onBedTimeChanged(time: moment.Moment) {
    console.log('TO IMPLEMENT')
  }



}
