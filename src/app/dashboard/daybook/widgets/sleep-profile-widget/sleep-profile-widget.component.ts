import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DaybookService } from '../../daybook.service';
import * as moment from 'moment';
import { SleepBatteryConfiguration } from '../sleep-battery/sleep-battery-configuration.interface';
import { faBed, faPlusCircle, faMinusCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { SleepQuality } from '../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum';
import { DurationString } from '../../../../shared/utilities/time-utilities/duration-string.class';
import { ItemState } from '../../../../shared/utilities/item-state.class';

@Component({
  selector: 'app-sleep-profile-widget',
  templateUrl: './sleep-profile-widget.component.html',
  styleUrls: ['./sleep-profile-widget.component.css']
})
export class SleepProfileWidgetComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private _itemState: ItemState;
  public get itemState(): ItemState{ return this._itemState; }
  public get mouseIsOver(): boolean{ return this._itemState.mouseIsOver; }

  public sleepProfileForm: FormGroup;
  private _batteryConfiguration: SleepBatteryConfiguration;
  public get batteryConfiguration(): SleepBatteryConfiguration{ return this._batteryConfiguration; }

  private _sleepQuality: SleepQuality;
  // public get sleepQuality(): SleepQuality { return this._sleepQuality; }

  public sleepQualityBeds: SleepQuality[] = [];

  private _fallAsleepTime: moment.Moment;
  private _fallAsleepTimeMin: moment.Moment;
  public get fallAsleepTime(): moment.Moment { return this._fallAsleepTime; }
  public get fallAsleepTimeMin(): moment.Moment { return this._fallAsleepTimeMin; }


  private _wakeupTime: moment.Moment;
  private _wakeupTimeMin: moment.Moment;
  public get wakeupTime(): moment.Moment { return this._wakeupTime; }
  public get wakeupTimeMin(): moment.Moment { return this._wakeupTimeMin; }

  private _bedTime: moment.Moment;
  public get bedTime(): moment.Moment { return this._bedTime; }

  private _sleepDuration: string = "";
  public get sleepDuration(): string { return this._sleepDuration; }


  public sleepProfileIsSet: boolean = true;



  ngOnInit() {

    this._itemState = new ItemState(null);

    if(this.daybookService.activeDay.sleepProfile.wakeupTimeISO){
       this._wakeupTime = moment(this.daybookService.activeDay.sleepProfile.wakeupTimeISO);
    }else{
      this._wakeupTime = moment(this.daybookService.activeDay.dateYYYYMMDD).hour(7).minute(30);
      this.sleepProfileIsSet = false;
    }
    this._wakeupTimeMin = moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).hour(18).minute(0).second(0).millisecond(0);
    if(this._wakeupTimeMin.isBefore(this.fallAsleepTime)){
      this._wakeupTimeMin = moment(this.fallAsleepTime);
    }


    if(this.daybookService.activeDay.previousDay.sleepProfile.fallAsleepTimeISO){
      this._fallAsleepTime = moment(this.daybookService.activeDay.previousDay.sleepProfile.fallAsleepTimeISO);
    }else{
      this._fallAsleepTime = moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).hour(22).minute(30);
      this.sleepProfileIsSet = false;
    }
    if(this.daybookService.activeDay.previousDay.timeReferencer.lastActionTime){
      this._fallAsleepTimeMin = moment(this.daybookService.activeDay.previousDay.timeReferencer.lastActionTime);
      if(this._fallAsleepTimeMin.isSameOrAfter(moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).endOf("day"))){
        // in this case, it would be after midnight, into this day
      }
    }


    if(this.daybookService.activeDay.sleepProfile.bedtimeISO){
      this._bedTime = moment(this.daybookService.activeDay.sleepProfile.bedtimeISO);
    }else{
      this._bedTime = moment(this.daybookService.activeDay.dateYYYYMMDD).hour(22).minute(30);
      this.sleepProfileIsSet = false;
    }

    

    this._batteryConfiguration = {
      fallAsleepTime: this._fallAsleepTime,
      wakeupTime: this._wakeupTime,
      bedtime: this._bedTime,
    }


    this.sleepQualityBeds = [
      SleepQuality.VeryPoor,
      SleepQuality.Poor,
      SleepQuality.Okay,
      SleepQuality.Well,
      SleepQuality.VeryWell,
    ];


    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this._wakeupTime);
  }

  private timeInputsChanged(){
    this._wakeupTimeMin = moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).hour(18).minute(0).second(0).millisecond(0);
    if(this._wakeupTimeMin.isBefore(this.fallAsleepTime)){
      this._wakeupTimeMin = moment(this.fallAsleepTime);
    }
    this._sleepDuration = DurationString.calculateDurationString(this._fallAsleepTime, this._wakeupTime);
  }


  public get clickFallAsleepTimeActive(): boolean{
    if(this._fallAsleepTime.format("YYYY-MM-DD") == this.daybookService.activeDay.dateYYYYMMDD){
      return true;
    }else{
      if(this._wakeupTime.diff(this._fallAsleepTime, "hours") >= 24){
        return true;
      }
    }
    return false;
  } 
  public onClickfallAsleepTimeDay(){
    if(this._fallAsleepTime.format("YYYY-MM-DD") == this.daybookService.activeDay.dateYYYYMMDD){
      this._fallAsleepTime = moment(this._fallAsleepTime).subtract(1, "days");
    }else{
      if(this._wakeupTime.diff(this._fallAsleepTime, "hours") >= 24){
        this._fallAsleepTime = moment(this._fallAsleepTime).add(1, "days");
      }
      // this._fallAsleepTime = moment(this._fallAsleepTime).add(1, "days");
      // if(this._fallAsleepTime.isAfter(this._wakeupTime)){
      //   if(this.daybookService.activeDay.previousDay.sleepProfile.fallAsleepTimeISO){
      //     this._fallAsleepTime = moment(this.daybookService.activeDay.previousDay.sleepProfile.fallAsleepTimeISO);
      //   }else{
      //     this._fallAsleepTime = moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).hour(22).minute(30);
      //   }
      // } 
    }
    this.timeInputsChanged();
  }


  public onFallAsleepTimeChanged(time: moment.Moment){
    this._fallAsleepTime = moment(time);
    this.timeInputsChanged();
  }

  public onWakeupTimeChanged(time: moment.Moment){
    this._wakeupTime = moment(time);
    this.timeInputsChanged();
  }

  public onBedTimeChanged(time: moment.Moment){
    this._bedTime = moment(time);
    this.timeInputsChanged();
  }

  public onClickSleepQuality(sleepQuality: SleepQuality){
    this._sleepQuality = sleepQuality;
  }

  public onClickSaveSleepTimes(){
    console.log("Saving");
    this._itemState.reset();
  }

  public get fallAsleepDateTime(): string{
    if(this._fallAsleepTime.format("YYYY-MM-DD") == this.daybookService.activeDay.dateYYYYMMDD){
      if(this._fallAsleepTime.hour() < 12){
        return "This morning at";
      }else{
        return "Today at";
      }
    }else if(this._fallAsleepTime.format("YYYY-MM-DD") == this.daybookService.activeDay.previousDay.dateYYYYMMDD){
      if(this._fallAsleepTime.hour() > 18){
        return "Yesterday evening at";
      }else{
        return "Yesterday at";
      }
    }
    return "";
  }
  public get wakeupDateTime(): string{
    if(this._wakeupTime.format("YYYY-MM-DD") == this.daybookService.activeDay.previousDay.dateYYYYMMDD){
      return " for this day (yesterday)"
    }else{
      if(this._wakeupTime.hour() < 12){
        return "this morning";
      }else{
        return "today";
      }
    }
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




  faBed = faBed;
  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faExclamationTriangle = faExclamationTriangle;

}
