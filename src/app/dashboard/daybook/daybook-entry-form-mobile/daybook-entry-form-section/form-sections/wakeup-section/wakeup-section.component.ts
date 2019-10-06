import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DaybookEntryForm } from '../../../daybook-entry-form.class';
import { faPlusCircle, faMinusCircle, faBed, faCheck } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { SleepQuality } from './sleep-quality.enum';
import { DurationString } from '../../../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookDayItemSleepProfile } from '../../../../api/data-items/daybook-day-item-sleep-profile.interface';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { DaybookEntryFormSection } from '../../daybook-entry-form-section.class';

@Component({
  selector: 'app-wakeup-section',
  templateUrl: './wakeup-section.component.html',
  styleUrls: ['./wakeup-section.component.css']
})
export class WakeupSectionComponent implements OnInit {

  constructor() { }

  sleepTimesFormGroup: FormGroup;

  

  sleepQualityBeds: any[] = [];
  private _sleepQuality: SleepQuality;
  private _sleepDuration: string = "";

  @Input() daybookEntryForm: DaybookEntryForm;
  @Input() formSection: DaybookEntryFormSection;

  ngOnInit() {
    this._sleepQuality = this.daybookEntryForm.sleepQuality;
    this.sleepQualityBeds = [
      SleepQuality.VeryPoor,
      SleepQuality.Poor,
      SleepQuality.Okay,
      SleepQuality.Well,
      SleepQuality.VeryWell,
    ];

    this._fallAsleepTime = this.daybookEntryForm.lastNightFallAsleepTime;
    this._wakeupTime = this.daybookEntryForm.wakeupTime;

    this.sleepTimesFormGroup = new FormGroup({
      fallAsleepTime: new FormControl(this._fallAsleepTime.format("HH:mm")),
      wakeupTime: new FormControl(this._wakeupTime.format("HH:mm")),
    });
    this.sleepTimesFormGroup.valueChanges.subscribe((valueChange) => {
      this.updateValues();
    })
    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this._wakeupTime);
  }



  public onClickSleepQuality(sleepQuality: SleepQuality) {
    this._sleepQuality = sleepQuality;
    this.daybookEntryForm.sleepQuality = sleepQuality;
  }


  public sleepQuality(sleepQuality: SleepQuality): string[] {
    let index = this.sleepQualityBeds.indexOf(sleepQuality);
    let currentIndex = this.sleepQualityBeds.indexOf(this._sleepQuality);
    if (index <= this.sleepQualityBeds.indexOf(this._sleepQuality)) {
      if (currentIndex == 0) {
        return ["sleep-quality-very-poor"];
      } else if (currentIndex == 1) {
        return ["sleep-quality-poor"];
      } else if (currentIndex == 2) {
        return ["sleep-quality-okay"];
      } else if (currentIndex == 3) {
        return ["sleep-quality-well"];
      } else if (currentIndex == 4) {
        return ["sleep-quality-very-well"];
      }
    }
    return [];
  }

  public get sleepQualityString(): string {
    if(this._sleepQuality){
      return this._sleepQuality.toString();
    }else{
      return "";
    }
    
  }






  private parseFormTimeInput(formInput: string): { hour: number, minute: number } {
    if (formInput) {
      let hours: number = Number(formInput.substring(0, 2));
      let minutes: number = Number(formInput.substring(3, 5));
      return {
        hour: hours,
        minute: minutes,
      }
    } else {
      return null;
    }
  }

  private _fallAsleepTime: moment.Moment;
  public get fallAsleepTime(): string {
    return this._fallAsleepTime.format("hh:mm a");
  }
  private _wakeupTime: moment.Moment;
  public get wakeupTime(): string {
    return this._wakeupTime.format("hh:mm a");
  }

  public onClickChangeTime(action: string, time: string) {
    if (time == "FALL_ASLEEP") {
      let fallAsleepTimeInput = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["fallAsleepTime"].value);
      let fallAsleepTime: moment.Moment = moment(this._fallAsleepTime).hour(fallAsleepTimeInput.hour).minute(fallAsleepTimeInput.minute).second(0).millisecond(0);
      if (action == "ADD") {
        if (this._wakeupTime.diff(fallAsleepTime, "minutes") > 30) {
          fallAsleepTime = moment(fallAsleepTime).add(30, "minutes");
        }
      } else if (action == "SUBTRACT") {
        fallAsleepTime = moment(fallAsleepTime).subtract(30, "minutes");
      }
      this.sleepTimesFormGroup.patchValue({ "fallAsleepTime": fallAsleepTime.format("HH:mm") });

      this._fallAsleepTime = moment(fallAsleepTime);
    }

    else if (time == "WAKE_UP") {
      let wakeupTimeInput = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["wakeupTime"].value);
      let wakeupTime: moment.Moment = moment(this._wakeupTime).hour(wakeupTimeInput.hour).minute(wakeupTimeInput.minute).second(0).millisecond(0);

      if (action == "ADD") {
        wakeupTime = moment(wakeupTime).add(30, "minutes");
      } else if (action == "SUBTRACT") {
        if (wakeupTime.diff(this._fallAsleepTime, "minutes") > 30) {
          wakeupTime = moment(wakeupTime).subtract(30, "minutes");
        }
      }

      this.sleepTimesFormGroup.patchValue({ "wakeupTime": wakeupTime.format("HH:mm") });
      this._wakeupTime = moment(wakeupTime);
    }

    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this._wakeupTime);
  }

  private updateValues() {
    let fallAsleepTimeInput = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["fallAsleepTime"].value);
    let fallAsleepTime: moment.Moment = moment(this._fallAsleepTime).hour(fallAsleepTimeInput.hour).minute(fallAsleepTimeInput.minute).second(0).millisecond(0);

    let wakeupTimeInput = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["wakeupTime"].value);
    let wakeupTime: moment.Moment = moment(this._wakeupTime).hour(wakeupTimeInput.hour).minute(wakeupTimeInput.minute).second(0).millisecond(0);

    if (fallAsleepTime.hour() < 12 && fallAsleepTime.format("YYYY-MM-DD") == moment(wakeupTime).subtract(1, "day").format("YYYY-MM-DD")) {
      fallAsleepTime = moment(fallAsleepTime).add(1, "days");
    }
    if (fallAsleepTime.hour() >= 12 && fallAsleepTime.format("YYYY-MM-DD") == wakeupTime.format("YYYY-MM-DD")) {
      fallAsleepTime = moment(fallAsleepTime).subtract(1, "days");
    }
    this._fallAsleepTime = moment(fallAsleepTime);
    this._wakeupTime = moment(wakeupTime);
    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this._wakeupTime);
  }

  public get sleepDuration(): string {
    return this._sleepDuration;
  }


  public get fallAsleepDateTime(): string {
    if (this._fallAsleepTime.dayOfYear() == (this._wakeupTime.dayOfYear() - 1)) {
      return "last night";
    } else if (this._fallAsleepTime.dayOfYear() == this._wakeupTime.dayOfYear()) {
      return "this morning";
    } else {
      return "earlier";
    }
  }


  public onClickSave() {

    /**
     * Warning:  this is currently discombobulated.
     * the way it is set up is the previous nights fall asleep time is set from this profile object, which is.... not appropriate.
     * probably need to improve on this to avoid confusion and bugs
     */

    let sleepProfile: DaybookDayItemSleepProfile = {
      fallAsleepTimeISO: this._fallAsleepTime.toISOString(),
      fallAsleepTimeUtcOffsetMinutes: this._fallAsleepTime.utcOffset(),
      wakeupTimeISO: this._wakeupTime.toISOString(),
      wakeupTimeUtcOffsetMinutes: this._wakeupTime.utcOffset(),
      sleepQuality: this._sleepQuality,
      bedtimeISO: this.daybookEntryForm.sleepProfile.bedtimeISO,
      bedtimeUtcOffsetMinutes: this.daybookEntryForm.sleepProfile.bedtimeUtcOffsetMinutes,
    }


    this.formSection.isComplete = true;
    this.formSection.title = this.wakeupTime + " wakeup";
    this.daybookEntryForm.onClickSaveSleepProfile(sleepProfile);
    this.formSection.onClickClose();
    
  }



  faBed = faBed;
  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faCheck = faCheck;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

}
