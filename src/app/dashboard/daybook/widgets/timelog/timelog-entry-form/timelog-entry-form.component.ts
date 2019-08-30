import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';

import { faEdit, faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';


import { TimelogEntryForm } from './timelog-entry-form.class';
import { faBed } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  constructor() { }


  timelogEntryForm: TimelogEntryForm;
  sleepTimesFormGroup: FormGroup;

  ngOnInit() {
    this.timelogEntryForm = new TimelogEntryForm();
    this.sleepTimesFormGroup = new FormGroup({
      fallAsleepTime: new FormControl(this.timelogEntryForm.lastNightFallAsleepTimeHHmm),
      wakeupTime: new FormControl(this.timelogEntryForm.wakeupTimeHHmm)
    })
  }


  public onClickBanner(banner: string) {
    this.timelogEntryForm.onClickBanner(banner);
  }


  public onClickSleepTimes() {
    // this.timelogEntryForm.saveTimes();
    let wakeupTime: any = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["wakeupTime"].value);
    let fallAsleepTime: any = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["fallAsleepTime"].value);
    this.timelogEntryForm.onClickSaveSleepTimes(wakeupTime, fallAsleepTime);
  }


  private parseFormTimeInput(formInput: string): { hour: number, minute: number } {
    console.log("form input value is: ", formInput);
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













  








  faEdit = faEdit;
  faBed = faBed;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  ngOnDestroy() {
    this.timelogEntryForm = null;
  }
}
