import { Component, OnInit } from '@angular/core';
import { DaybookService } from '../../../daybook.service';
import * as moment from 'moment';
import { DaybookTimeReferencer } from '../../../api/controllers/daybook-time-referencer.class';
import { SleepQuality } from '../../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum';

@Component({
  selector: 'app-sleep-profile-form',
  templateUrl: './sleep-profile-form.component.html',
  styleUrls: ['./sleep-profile-form.component.css']
})
export class SleepProfileFormComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  public wakeupTime: moment.Moment;
  public wakeupTimeMin: moment.Moment;
  public wakeupTimeMax: moment.Moment;

  public previousBedTime: moment.Moment;
  public previousBedTimeMin: moment.Moment;
  public previousBedTimeMax: moment.Moment;

  public bedTime: moment.Moment;
  public bedTimeMin: moment.Moment;
  public bedTimeMax: moment.Moment;

  public isEditingWakeupTime: boolean = false;
  public isEditingPreviousBedTime: boolean = false;
  public isEditingBedTime: boolean = false;

  public sleepQuality: SleepQuality;
  // public get sleepQuality(): SleepQuality { return this._sleepQuality; }

  public sleepQualityBeds: SleepQuality[] = [
    SleepQuality.VeryPoor,
    SleepQuality.Poor,
    SleepQuality.Okay,
    SleepQuality.Well,
    SleepQuality.VeryWell,
  ];

  ngOnInit() {
    this.reInitiate();
    this.daybookService.activeDay$.subscribe((dayChanged) => {
      console.log("SLEEP PROFILE WIDGET: REINITIATING  - " + dayChanged.dateYYYYMMDD);
      this.reInitiate();
    });
  }


  private reInitiate() {
    const timeReferencer: DaybookTimeReferencer = this.daybookService.activeDay.timeReferencer;
    this.wakeupTime = timeReferencer.thisDayWakeupTime;
    this.wakeupTimeMin = timeReferencer.wakeupTimeMin;
    this.wakeupTimeMax = timeReferencer.wakeupTimeMax;
    if (this.daybookService.activeDayIsToday) {
      this.wakeupTimeMax = moment();
    }


    this.previousBedTime = timeReferencer.previousDayBedTime;
    this.previousBedTimeMin = timeReferencer.previousBedTimeMin;
    this.previousBedTimeMax = timeReferencer.previousBedTimeMax;

    this.bedTime = timeReferencer.thisDayBedTime;
    this.bedTimeMin = timeReferencer.bedTimeMin;
    this.bedTimeMax = timeReferencer.bedTimeMax;


    this.sleepQuality = this.daybookService.activeDay.sleepProfile.sleepQuality;

    console.log("REINITIATE:  SLeep profile: :: : : :")
    console.log(" this wakeup time:  " + this.wakeupTime.format("YYYY-MM-DD hh:mm a"))
    console.log(" this bed time:  " + this.bedTime.format("YYYY-MM-DD hh:mm a"))

  }

  public onClickSaveSleepProfile() {

    const sleepProfile = this.daybookService.activeDay.sleepProfile;

    sleepProfile.setSleepQuality(this.sleepQuality);
    sleepProfile.setBedTime(this.bedTime);
    sleepProfile.setWakeupTime(this.wakeupTime);
    console.log("Savcing changes on sleep profile: ");
    console.log("  wakeupTime: " + sleepProfile.wakeupTime.format('YYYY-MM-DD hh:mm a'))
    console.log("  bedTime: " + sleepProfile.bedTime.format('YYYY-MM-DD hh:mm a'))

    sleepProfile.saveChanges();
  }

  public onWakeupTimeChanged(time: moment.Moment) {
    this.wakeupTime = time;
  }

  public onPreviousFallAsleepTimeChanged(time: moment.Moment) {

  }
  public onBedTimeChanged(time: moment.Moment) {
    this.bedTime = time;
  }


}
