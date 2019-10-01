import { Component, OnInit, Input } from '@angular/core';
import { DaybookEntryForm } from '../../../daybook-entry-form.class';
import { DaybookEntryFormSection } from '../../daybook-entry-form-section.class';
import { faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaybookDayItemSleepProfile } from '../../../../api/data-items/daybook-day-item-sleep-profile.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-bedtime-section',
  templateUrl: './bedtime-section.component.html',
  styleUrls: ['./bedtime-section.component.css']
})
export class BedtimeSectionComponent implements OnInit {

  constructor() { }

  @Input() daybookEntryForm: DaybookEntryForm;
  @Input() formSection: DaybookEntryFormSection;


  bedtimeForm: FormGroup;
  private _bedtime: moment.Moment;

  ngOnInit() { 
    this._bedtime = moment(this.daybookEntryForm.bedtime);
    this.bedtimeForm = new FormGroup({
      "bedtime": new FormControl(this.daybookEntryForm.bedtime.format('HH:mm'), Validators.required),
    });
    console.log("Bedtime is set to: " + this.daybookEntryForm.bedtime.format('HH:mm'))
  }

  public onClickChangeBedtime(action: string){
    let bedTimeInput = this.parseFormTimeInput(this.bedtimeForm.controls["fallAsleepTime"].value);
    let bedtime: moment.Moment = moment(this._bedtime).hour(bedTimeInput.hour).minute(bedTimeInput.minute).second(0).millisecond(0);
    if(action === "ADD"){
      bedtime = moment(bedtime).add(30, "minutes");
    }else if(action === "SUBTRACT"){
      bedtime = moment(bedtime).subtract(30, "minutes");
    }

    this.bedtimeForm.patchValue({ "bedtime": bedtime.format("HH:mm") });
    this._bedtime = moment(bedtime);
  }

  public onClickSave(){
    let bedTimeInput = this.parseFormTimeInput(this.bedtimeForm.controls["bedtime"].value);
    let bedtime: moment.Moment = moment(this.daybookEntryForm.bedtime).hour(bedTimeInput.hour).minute(bedTimeInput.minute).second(0).millisecond(0);
    let sleepProfile: DaybookDayItemSleepProfile = this.daybookEntryForm.sleepProfile;
    sleepProfile["bedtimeISO"] = bedtime.toISOString(),
    sleepProfile["bedtimeUtcOffsetMinutes"] = bedtime.utcOffset(),
    this.daybookEntryForm.onClickSaveSleepProfile(sleepProfile);
    this.formSection.isComplete = true;
    this.formSection.title = this.daybookEntryForm.bedtime.format("h:mm a") + " bedtime";
    this.formSection.onClickClose();
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


  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
}
