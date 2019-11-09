import { Component, OnInit } from '@angular/core';
import { DaybookService } from '../../../daybook.service';
import * as moment from 'moment';
import { DaybookTimeReferencer } from '../../../api/controllers/daybook-time-referencer.class';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { SleepQuality } from '../../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum';

@Component({
  selector: 'app-sleep-profile-form',
  templateUrl: './sleep-profile-form.component.html',
  styleUrls: ['./sleep-profile-form.component.css']
})
export class SleepProfileFormComponent implements OnInit {

  faExclamationTriangle = faExclamationTriangle;

  constructor(private daybookService: DaybookService) { }

  public wakeupTime: moment.Moment;
  public wakeupTimeMin: moment.Moment;
  public wakeupTimeMax: moment.Moment;


  public bedTime: moment.Moment;
  public bedTimeMin: moment.Moment;
  public bedTimeMax: moment.Moment;

  public isEditingWakeupTime: boolean = false;
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

  public get wakeupTimeIsSet(): boolean { return this.daybookService.activeDay.timeReferencer.thisDayWakeupTime.isSet; }
  public get bedTimeIsSet(): boolean { return this.daybookService.activeDay.timeReferencer.thisDayBedTime.isSet; }
  public get previousBedTimeIsSet(): boolean { return this.daybookService.activeDay.timeReferencer.previousDayBedTime.isSet; }
  public get previousBedTime(): moment.Moment { return this.daybookService.activeDay.timeReferencer.previousDayBedTime.startTime; }

  ngOnInit() {
    this.reInitiate();
    this.daybookService.activeDay$.subscribe((dayChanged) => {
      console.log("SLEEP PROFILE WIDGET: REINITIATING  - " + dayChanged.dateYYYYMMDD);
      this.reInitiate();
    });
  }


  private reInitiate() {
    const timeReferencer: DaybookTimeReferencer = this.daybookService.activeDay.timeReferencer;
    this.wakeupTime = timeReferencer.thisDayWakeupTime.startTime;
    this.bedTime = timeReferencer.thisDayBedTime.startTime;
    this.bedTimeMin = timeReferencer.bedTimeMin;
    this.bedTimeMax = timeReferencer.bedTimeMax;
    this.wakeupTimeMin = timeReferencer.wakeupTimeMin;
    this.wakeupTimeMax = timeReferencer.wakeupTimeMax;






    this.sleepQuality = this.daybookService.activeDay.sleepProfile.sleepQuality;

    // console.log("REINITIATE:  SLeep profile: :: : : :")
    // console.log(" this wakeup time:  " + this.wakeupTime.format("YYYY-MM-DD hh:mm a"))
    // console.log(" this bed time:  " + this.bedTime.format("YYYY-MM-DD hh:mm a"))

    // console.log(" Wake up time is set? " + this.wakeupTimeIsSet)
    // console.log(" bed time is set ? " + this.bedTimeIsSet)

    if (this.bedTimeIsSet) {
      this.isEditingBedTime = false;
    } else {
      this.isEditingBedTime = true;
    }
    if (this.wakeupTimeIsSet) {
      this.isEditingWakeupTime = false;
    } else {
      this.isEditingWakeupTime = true;
    }
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
    this.isEditingBedTime = false;
    this.isEditingWakeupTime = false;
  }

  public onWakeupTimeChanged(time: moment.Moment) {
    if (time.isSameOrAfter(this.wakeupTimeMax)) {
      this.wakeupTime = this.wakeupTimeMax
    } if (time.isSameOrBefore(this.wakeupTimeMin)) {
      this.wakeupTime = this.wakeupTimeMin;
    } else {
      this.wakeupTime = time;
    }

  }

  public onBedTimeChanged(time: moment.Moment) {
    if (time.isSameOrAfter(this.bedTimeMax)) {
      this.bedTime = this.bedTimeMax;
    } if (time.isSameOrBefore(this.bedTimeMin)) {
      this.bedTime = this.bedTimeMin;
    } else {
      this.bedTime = time;
    }
  }



}
