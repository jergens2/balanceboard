import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DaybookService } from '../../daybook.service';
import * as moment from 'moment';
import { SleepBatteryConfiguration } from '../sleep-battery/sleep-battery-configuration.interface';
import { faBed, faPlusCircle, faMinusCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { SleepQuality } from '../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum';
import { DurationString } from '../../../../shared/utilities/time-utilities/duration-string.class';
import { ItemState } from '../../../../shared/utilities/item-state.class';
import { DaybookDayItem } from '../../api/daybook-day-item.class';
import { DaybookDayItemSleepProfile } from '../../api/data-items/daybook-day-item-sleep-profile.interface';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-sleep-profile-widget',
  templateUrl: './sleep-profile-widget.component.html',
  styleUrls: ['./sleep-profile-widget.component.css']
})
export class SleepProfileWidgetComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private _itemState: ItemState;
  public get itemState(): ItemState { return this._itemState; }
  public get mouseIsOver(): boolean { return this._itemState.mouseIsOver; }

  public sleepProfileForm: FormGroup;
  private _batteryConfiguration: SleepBatteryConfiguration;
  public get batteryConfiguration(): SleepBatteryConfiguration { return this._batteryConfiguration; }

  private _sleepQuality: SleepQuality;
  // public get sleepQuality(): SleepQuality { return this._sleepQuality; }

  public sleepQualityBeds: SleepQuality[] = [
    SleepQuality.VeryPoor,
    SleepQuality.Poor,
    SleepQuality.Okay,
    SleepQuality.Well,
    SleepQuality.VeryWell,
  ];

  private _previousFallAsleepTime: moment.Moment;
  private _previousFallAsleepTimeMin: moment.Moment;
  public get previousFallAsleepTime(): moment.Moment { return this._previousFallAsleepTime; }
  public get previousFallAsleepTimeMin(): moment.Moment { return this._previousFallAsleepTimeMin; }



  private _wakeupTime: moment.Moment;
  private _wakeupTimeMin: moment.Moment;
  public get wakeupTime(): moment.Moment { return this._wakeupTime; }
  public get wakeupTimeMin(): moment.Moment { return this._wakeupTimeMin; }

  private _bedTime: moment.Moment;
  public get bedTime(): moment.Moment { return this._bedTime; }

  private _sleepDuration: string = "";
  public get sleepDuration(): string { return this._sleepDuration; }
  private _sleepDurationHours: string = "";
  public get sleepDurationHours(): string { return this._sleepDurationHours; }


  public sleepProfileIsSet: boolean = true;



  ngOnInit() {
    this.daybookService.activeDay$.subscribe((dayChanged) => {
      this.reInitiate();
    });
  }


  private reInitiate() {
    this.sleepProfileIsSet = true;
    this._itemState = new ItemState(null);

    let sleepProfile: DaybookDayItemSleepProfile = this.daybookService.activeDay.sleepProfile;

    if(sleepProfile.sleepQuality){
      this._sleepQuality = sleepProfile.sleepQuality;
    }

    if (sleepProfile.wakeupTimeISO) {
      this._wakeupTime = moment(sleepProfile.wakeupTimeISO);
    } else {
      this._wakeupTime = moment(this.daybookService.activeDay.dateYYYYMMDD).hour(7).minute(30);
      this.sleepProfileIsSet = false;
    }
    this._wakeupTimeMin = moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).hour(18).minute(0).second(0).millisecond(0);
    if (this._wakeupTimeMin.isBefore(this.previousFallAsleepTime)) {
      this._wakeupTimeMin = moment(this.previousFallAsleepTime);
    }


    if (sleepProfile.previousFallAsleepTimeISO) {
      this._previousFallAsleepTime = moment(sleepProfile.previousFallAsleepTimeISO);
    } else {
      this._previousFallAsleepTime = moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).hour(22).minute(30);
      this.sleepProfileIsSet = false;
    }
    if (this.daybookService.activeDay.previousDay.timeReferencer.lastActionTime) {
      this._previousFallAsleepTimeMin = moment(this.daybookService.activeDay.previousDay.timeReferencer.lastActionTime);
      if (this._previousFallAsleepTimeMin.isSameOrAfter(moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).endOf("day"))) {
        // in this case, it would be after midnight, into this day
      }
    }


    if (sleepProfile.bedtimeISO) {
      this._bedTime = moment(sleepProfile.bedtimeISO);
      console.log("Reinitiate, bedtime: ", this._bedTime.format("YYYY-MM-DD hh:mm a"))
    } else {
      this._bedTime = moment(this.daybookService.activeDay.dateYYYYMMDD).hour(22).minute(30);
      this.sleepProfileIsSet = false;
    }



    this._batteryConfiguration = {
      previousFallAsleepTime: this._previousFallAsleepTime,
      wakeupTime: this._wakeupTime,
      bedtime: this._bedTime,
    }

    this.updateDurationString();
  }

  private _timeUntilBedtimeSubscription: Subscription = new Subscription();
  private updateDurationString() {
    this._wakeupTimeMin = moment(this.daybookService.activeDay.previousDay.dateYYYYMMDD).hour(18).minute(0).second(0).millisecond(0);
    if (this._wakeupTimeMin.isBefore(this.previousFallAsleepTime)) {
      this._wakeupTimeMin = moment(this.previousFallAsleepTime);
    }
    this._sleepDuration = DurationString.calculateDurationString(this._previousFallAsleepTime, this._wakeupTime);
    this._sleepDurationHours = DurationString.calculateDurationString(this._previousFallAsleepTime, this._wakeupTime, false, true);
    this.updateTimeUntilBedtime();
    this.updateAwakeForString();
    this.updateIsPastMidnight();
    
    if(this.activeDayIsToday){
      this._timeUntilBedtimeSubscription.unsubscribe();
      this._timeUntilBedtimeSubscription = timer(0, 60000).subscribe((tick)=>{
        this.updateTimeUntilBedtime();
        this.updateAwakeForString();
        this.updateIsPastMidnight();
      });
      
    }
    
  }

  private updateTimeUntilBedtime(){
    let hoursUntilBedtime: number = moment(this._bedTime).diff(moment(), "hours");
    if(hoursUntilBedtime > 2){
      this._timeUntilBedTime = DurationString.calculateDurationString(moment(), this._bedTime, false, true) + " until bedtime";
    }else{
      this._timeUntilBedTime = DurationString.calculateDurationString(moment(), this._bedTime, false, false) + " until bedtime";
    }
  }

  private updateAwakeForString(){
    let awakeForHours: number = moment().diff(this._wakeupTime, "hours");
    if(awakeForHours < 2){
      this._awakeForString = DurationString.calculateDurationString(this._wakeupTime, moment(), false, false);
    }else{
      this._awakeForString = DurationString.calculateDurationString(this._wakeupTime, moment(), false, true);
    }
  }

  private updateIsPastMidnight(){ 
    let isPastMidnight: boolean = false;
    if(this.daybookService.activeDayIsToday){
      let yesterdayWakeup: string = this.daybookService.activeDay.previousDay.sleepProfile.wakeupTimeISO;
      let activeDayWakeup: string = this.daybookService.activeDay.sleepProfile.wakeupTimeISO;
      // if(!this.daybookService.activeDay.sleepProfile.wakeupTimeISO)
    }
    return isPastMidnight;
  }

  public get clickFallAsleepTimeActive(): boolean {
    if (this._previousFallAsleepTime.format("YYYY-MM-DD") == this.daybookService.activeDay.dateYYYYMMDD) {
      return true;
    } else {
      if (this._wakeupTime.diff(this._previousFallAsleepTime, "hours") >= 24) {
        return true;
      }
    }
    return false;
  }
  public onClickpreviousFallAsleepTimeDay() {
    if (this._previousFallAsleepTime.format("YYYY-MM-DD") == this.daybookService.activeDay.dateYYYYMMDD) {
      this._previousFallAsleepTime = moment(this._previousFallAsleepTime).subtract(1, "days");
    } else {
      if (this._wakeupTime.diff(this._previousFallAsleepTime, "hours") >= 24) {
        this._previousFallAsleepTime = moment(this._previousFallAsleepTime).add(1, "days");
      }
    }
    this.updateDurationString();

  }


  public onFallAsleepTimeChanged(time: moment.Moment) {
    this._previousFallAsleepTime = moment(time);
    this.updateDurationString();
  }

  public onWakeupTimeChanged(time: moment.Moment) {
    this._wakeupTime = moment(time);
    this.updateDurationString();
  }

  public onBedTimeChanged(time: moment.Moment) {
    this._bedTime = moment(time);
    console.log("Bed time changed", this._bedTime.format("YYYY-MM-DD hh:mm a"))
    this.updateDurationString();
  }

  public onClickSleepQuality(sleepQuality: SleepQuality) {
    this._sleepQuality = sleepQuality;
  }

  public onClickSaveSleepTimes() {
    console.log("Saving");
    let sleepProfile: DaybookDayItemSleepProfile = this.daybookService.activeDay.sleepProfile;

    sleepProfile.sleepQuality = this._sleepQuality;

    sleepProfile.previousFallAsleepTimeISO = this._previousFallAsleepTime.toISOString();
    sleepProfile.previousFallAsleepTimeUtcOffsetMinutes = this._previousFallAsleepTime.utcOffset();

    sleepProfile.wakeupTimeISO = this._wakeupTime.toISOString();
    sleepProfile.wakeupTimeUtcOffsetMinutes = this._wakeupTime.utcOffset();

    sleepProfile.bedtimeISO = this._bedTime.toISOString();
    sleepProfile.bedtimeUtcOffsetMinutes = this._bedTime.utcOffset();

    this.daybookService.activeDay.sleepProfile = sleepProfile;
    this.reInitiate();
  }

  public get previousFallAsleepDateTime(): string {
    if (this._previousFallAsleepTime.format("YYYY-MM-DD") == this.daybookService.activeDay.dateYYYYMMDD) {
      if (this._previousFallAsleepTime.hour() < 12) {
        return "This morning at";
      } else {
        return "Today at";
      }
    } else if (this._previousFallAsleepTime.format("YYYY-MM-DD") == this.daybookService.activeDay.previousDay.dateYYYYMMDD) {
      if (this._previousFallAsleepTime.hour() > 18) {
        return "Yesterday evening at";
      } else {
        return "Yesterday at";
      }
    }
    return "";
  }
  public get wakeupDateTime(): string {
    if (this._wakeupTime.format("YYYY-MM-DD") == this.daybookService.activeDay.previousDay.dateYYYYMMDD) {
      return " for this day (yesterday)"
    } else {
      if (this._wakeupTime.hour() < 12) {
        return "this morning";
      } else {
        return "today";
      }
    }
  }

  private _timeUntilBedTime: string = "";
  public get timeUntilBedTime(): string{ return this._timeUntilBedTime; }

  private _awakeForString: string = "";
  public get awakeForString(): string{ return this._awakeForString; }

  public sleepQualityClass(sleepQuality: SleepQuality): string[] {
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
    if (this._sleepQuality) {
      return this._sleepQuality.toString();
    } else {
      return "";
    }
  }

  public get activeDayIsToday(): boolean {
    return this.daybookService.activeDayIsToday;
  }

  private _isPastMidnight: boolean = false;
  public get isPastMidnight(): boolean{ return this._isPastMidnight;  }

  public get saveButtonDisabled(): boolean {
    return (this._sleepQuality == null);
  }



  faBed = faBed;
  faEdit = faEdit;
  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faExclamationTriangle = faExclamationTriangle;

}
