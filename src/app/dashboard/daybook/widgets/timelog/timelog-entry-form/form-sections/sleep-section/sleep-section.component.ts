import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TimelogEntryForm } from '../../timelog-entry-form.class';
import { faPlus, faMinus, faPlusCircle, faMinusCircle, faBed, faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { SleepQuality } from './sleep-quality.enum';
import { DurationString } from '../../../../../../../shared/utilities/duration-string.class';
import { DaybookDayItemSleepProfile } from '../../../../../api/data-items/daybook-day-item-sleep-profile.interface';

@Component({
  selector: 'app-sleep-section',
  templateUrl: './sleep-section.component.html',
  styleUrls: ['./sleep-section.component.css']
})
export class SleepSectionComponent implements OnInit {

  constructor() { }

  sleepTimesFormGroup: FormGroup;

  sleepQualityBeds: any[] = [];
  private _sleepQuality: SleepQuality;
  private _sleepDuration: string = "";

  isExpanded: boolean = false;

  @Input() timelogEntryForm: TimelogEntryForm;

  ngOnInit() {
    this._sleepQuality = this.timelogEntryForm.sleepQuality;
    this.sleepQualityBeds = [
      SleepQuality.VeryPoor,
      SleepQuality.Poor,
      SleepQuality.Okay,
      SleepQuality.Well,
      SleepQuality.VeryWell,
    ];

    this._fallAsleepTime = this.timelogEntryForm.lastNightFallAsleepTime;
    this._wakeupTime = this.timelogEntryForm.wakeupTime;
    this.sleepTimesFormGroup = new FormGroup({
      fallAsleepTime: new FormControl(this._fallAsleepTime.format("HH:mm")),
      wakeupTime: new FormControl(this._wakeupTime.format("HH:mm")),
    });
    this.sleepTimesFormGroup.valueChanges.subscribe((valueChange)=>{
      this.updateValues();
    })
    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this._wakeupTime);
  }

  public onClickSleepQuality(sleepQuality: SleepQuality){
    this._sleepQuality = sleepQuality;
    this.timelogEntryForm.sleepQuality = sleepQuality;
  }

  
  public sleepQuality(sleepQuality: SleepQuality): string[]{
    let index = this.sleepQualityBeds.indexOf(sleepQuality);
    let currentIndex = this.sleepQualityBeds.indexOf(this._sleepQuality);
    if(index <= this.sleepQualityBeds.indexOf(this._sleepQuality)){
      if(currentIndex == 0){
        return ["sleep-quality-very-poor"];
      }else if(currentIndex == 1){
        return ["sleep-quality-poor"];
      }else if(currentIndex == 2){
        return ["sleep-quality-okay"];
      }else if(currentIndex == 3){
        return ["sleep-quality-well"];
      }else if(currentIndex == 4){
        return ["sleep-quality-very-well"];
      }
    }
    return [];
  }

  public get sleepQualityString(): string{
    return this._sleepQuality.toString();
  }

  public onClickSave() {
    let sleepProfile: DaybookDayItemSleepProfile = {
      previousFallAsleepTimeISO: this._fallAsleepTime.toISOString(),
      previousFallAsleepTimeUtcOffsetMinutes: this._fallAsleepTime.utcOffset(),
      wakeupTimeISO: this._wakeupTime.toISOString(),
      wakeupTimeUtcOffsetMinutes: this._wakeupTime.utcOffset(),
      sleepQuality: this._sleepQuality,
      bedtimeISO: this.timelogEntryForm.bedtime.toISOString(),
      bedtimeUtcOffsetMinutes: this.timelogEntryForm.bedtime.utcOffset(),
    }
    this.timelogEntryForm.onClickSaveSleepTimes(sleepProfile);
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
  private _wakeupTime: moment.Moment;

  public onClickChangeTime(action: string, time: string) {
    if (time == "FALL_ASLEEP") {
      let fallAsleepTimeInput = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["fallAsleepTime"].value);
      let fallAsleepTime: moment.Moment = moment(this._fallAsleepTime).hour(fallAsleepTimeInput.hour).minute(fallAsleepTimeInput.minute).second(0).millisecond(0);
      if (action == "ADD") {
        if(this._wakeupTime.diff(fallAsleepTime, "minutes") > 30){
          fallAsleepTime = moment(fallAsleepTime).add(30, "minutes");
        }
      } else if (action == "SUBTRACT") {
        fallAsleepTime = moment(fallAsleepTime).subtract(30, "minutes");
      }
      this.sleepTimesFormGroup.patchValue({ "fallAsleepTime": fallAsleepTime.format("HH:mm") });

      this._fallAsleepTime = moment(fallAsleepTime);
    } 
        
    else if (time == "WAKE_UP") {
      let wakeupTime: moment.Moment = moment(this._wakeupTime);
      if (action == "ADD") {
        wakeupTime = moment(wakeupTime).add(30, "minutes");
      } else if (action == "SUBTRACT") {
        if(wakeupTime.diff(this._fallAsleepTime, "minutes") > 30){
          wakeupTime = moment(wakeupTime).subtract(30, "minutes");
        }        
      }
      
      this.sleepTimesFormGroup.patchValue({ "wakeupTime": wakeupTime.format("HH:mm") });
      this._wakeupTime = moment(wakeupTime);
    }

    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this._wakeupTime);
  }

  private updateValues(){
    let fallAsleepTimeInput = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["fallAsleepTime"].value);
    let fallAsleepTime: moment.Moment = moment(this._fallAsleepTime).hour(fallAsleepTimeInput.hour).minute(fallAsleepTimeInput.minute).second(0).millisecond(0);

    let wakeupTimeInput = this.parseFormTimeInput(this.sleepTimesFormGroup.controls["wakeupTime"].value);
    let wakeupTime: moment.Moment = moment(this._wakeupTime).hour(wakeupTimeInput.hour).minute(wakeupTimeInput.minute).second(0).millisecond(0);

    this._fallAsleepTime = moment(fallAsleepTime);
    this._wakeupTime = moment(wakeupTime);
    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this._wakeupTime);
  }

  public get sleepDuration(): string{
    return this._sleepDuration;
  }


  public get fallAsleepDateTime(): string {
    if(this._fallAsleepTime.dayOfYear() == (this._wakeupTime.dayOfYear()-1)){
      return "last night";
    }else if(this._fallAsleepTime.dayOfYear() == this._wakeupTime.dayOfYear()){
      return "this morning";
    }else{
      return "earlier";
    }
  }

  faBed = faBed;
  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faCheck = faCheck;
  faCircle = faCircle;

}
