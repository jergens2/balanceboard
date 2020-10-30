import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { SleepBatteryConfiguration } from '../sleep-battery/sleep-battery-configuration.interface';
import { faBed, faPlusCircle, faMinusCircle, faExclamationTriangle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { SleepService } from '../../sleep-manager/sleep.service';
import { DaybookDisplayService } from '../../daybook-display.service';
import { DaybookDayItem } from '../../daybook-day-item/daybook-day-item.class';
import { DTSItemTimeLimiter } from '../../display-manager/daybook-time-schedule/dts-item-time-limiter.class';
import { TimeInput } from '../../../../../app/shared/components/time-input/time-input.class';
import { DaybookUpdateAction } from '../../display-manager/daybook-update-action.enum';

@Component({
  selector: 'app-sleep-profile-widget',
  templateUrl: './sleep-profile-widget.component.html',
  styleUrls: ['./sleep-profile-widget.component.css']
})
export class SleepProfileWidgetComponent implements OnInit {

  constructor(private sleepService: SleepService, private daybookService: DaybookDisplayService) { }

  faCircle = faCircle;
  public sleepProfileForm: FormGroup;
  private _batteryConfiguration: SleepBatteryConfiguration;
  public get batteryConfiguration(): SleepBatteryConfiguration { return this._batteryConfiguration; }

  private _wakeupLabel: string;
  private _wakeupDate: string;
  private _wakeupTime: string;

  private _sleepAtLabel: string;
  private _sleepAtDate: string;
  private _sleepAtTime: string;

  private _wakeupInput: TimeInput;
  private _sleepInput: TimeInput;

  private _isEditingWakeupTime: boolean = false;
  private _isEditingFallAsleepTime: boolean = false;

  public get wakeupLabel(): string { return this._wakeupLabel; }
  public get wakeupDate(): string { return this._wakeupDate; }
  public get wakeupTime(): string { return this._wakeupTime; }

  public get bedtimeLabel(): string { return this._sleepAtLabel; }
  public get bedtimeDate(): string { return this._sleepAtDate; }
  public get bedtime(): string { return this._sleepAtTime; }

  public get wakeupInput(): TimeInput { return this._wakeupInput; }
  public get fallAsleepInput(): TimeInput { return this._sleepInput; }

  public get isEditingWakeupTime(): boolean { return this._isEditingWakeupTime; }
  public get isEditingFallAsleepTime(): boolean { return this._isEditingFallAsleepTime; }



  ngOnInit() {
    this._update();
    this.daybookService.displayUpdated$.subscribe(update => {
      this._update();
      if (update === DaybookUpdateAction.CALENDAR) {
        this._isEditingFallAsleepTime = false;
        this._isEditingWakeupTime = false;
      }
    });
  }

  public onWakeupTimeChanged(time: moment.Moment) {

  }

  public onClickWakeupTime() { this._isEditingWakeupTime = true; }
  public onClickFallAsleepTime() { this._isEditingFallAsleepTime = true; }
  public onClickSaveWakeup() {
    console.log("Not implemented");
    this._isEditingWakeupTime = false;
    this._update();
  }
  public onClickDiscardWakeup() {
    this._isEditingWakeupTime = false;
    this._update();
  }
  public onClickSaveFallAsleep() {
    console.log("Not implemented");
    this._isEditingFallAsleepTime = false;
    this._update();
  }
  public onClickDiscardFallAsleep() {
    this._isEditingFallAsleepTime = false;
    this._update();
  }

  private _update() {

    const sleepProfile = this.daybookService.sleepDisplayProfile;
    const todayYYYYMMDD: string = moment().format('YYYY-MM-DD');
    const currentDateYYYYMMDD: string = this.daybookService.activeDateYYYYMMDD;
    if (todayYYYYMMDD === currentDateYYYYMMDD) {
      this._wakeupLabel = 'Woke up at:';
      this._sleepAtLabel = 'Bed time:';
    } else if (currentDateYYYYMMDD > todayYYYYMMDD) {
      this._wakeupLabel = 'Wakeup time:';
      this._sleepAtLabel = 'Bed time:';
    } else if (currentDateYYYYMMDD < todayYYYYMMDD) {
      this._wakeupLabel = 'Woke up at:';
      this._sleepAtLabel = 'Went to sleep at:';
    }

    this._wakeupTime = sleepProfile.wakeupTime.format('h:mm a');
    this._wakeupDate = sleepProfile.wakeupTime.format('YYYY-MM-DD');
    this._sleepAtTime = sleepProfile.fallAsleepTime.format('h:mm a');
    this._sleepAtDate = sleepProfile.fallAsleepTime.format('YYYY-MM-DD');
    this._wakeupInput = sleepProfile.wakeupInput;
    this._sleepInput = sleepProfile.fallAsleepInput;
  }
}
