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
import { TimeInput } from '../../../../shared/components/time-input/time-input.class';
import { DaybookUpdateAction } from '../../display-manager/daybook-update-action.enum';
import { SleepDaybookItemUpdater } from '../../sleep-manager/sleep-data-prompt/sleep-data-form/sleep-daybook-item-updater.class';
import { DaybookHttpService } from '../../daybook-day-item/daybook-http.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sleep-profile-widget',
  templateUrl: './sleep-profile-widget.component.html',
  styleUrls: ['./sleep-profile-widget.component.css']
})
export class SleepProfileWidgetComponent implements OnInit {

  constructor(private sleepService: SleepService,
    private daybookService: DaybookDisplayService,
    private daybookHttpService: DaybookHttpService) { }

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
      this._update(update);
      if (update === DaybookUpdateAction.CALENDAR) {
        this._isEditingFallAsleepTime = false;
        this._isEditingWakeupTime = false;
      }
    });
  }


  public onClickWakeupTime() {
    const tomorrowYYYYMMDD: string = moment().add(1, 'days').format('YYYY-MM-DD');
    if (this.daybookService.activeDateYYYYMMDD <= tomorrowYYYYMMDD) {
      this._isEditingWakeupTime = true;
    }
  }
  public onClickFallAsleepTime() {
    const todayYYYYMMDD: string = moment().format('YYYY-MM-DD');
    if (this.daybookService.activeDateYYYYMMDD <= todayYYYYMMDD) {
      this._isEditingFallAsleepTime = true;
    }
  }
  public onClickSaveWakeup() {
    const dateYYYYMMDD: string = this.daybookService.activeDateYYYYMMDD;
    const wakeupTime: moment.Moment = this.daybookService.sleepDisplayProfile.wakeupInput.timeValue;
    const currentVal: moment.Moment = this.daybookService.sleepDisplayProfile.wakeupTime;
    const dayItemUpdater: SleepDaybookItemUpdater = new SleepDaybookItemUpdater();
    const dayItems = this.daybookService.daybookController.dayItems;

    console.log("changing wakeup time: " + wakeupTime.format('YYYY-MM-DD hh:mm a'));

    const dayIsToday: boolean = moment().format('YYYY-MM-DD') === dateYYYYMMDD;
    const dayIsTomorrow: boolean = moment().add(1, 'days').format('YYYY-MM-DD') === dateYYYYMMDD;
    const updateItems = dayItemUpdater.changeWakeupTime(dateYYYYMMDD, currentVal, wakeupTime, dayItems);
    if (dayIsToday) {
      console.log("today is today")
      forkJoin([
        this.sleepService.changePrevWakeupTime$(wakeupTime),
        this.daybookHttpService.updateDaybookDayItems$(updateItems)
      ]).subscribe({
        next: (a) => { },
        error: (e) => console.log('Error: ', e),
        complete: () => {
          console.log("forkjoin complete")
          this._isEditingWakeupTime = false;
          this._update();
          this.daybookService.refreshDisplay();
        }
      });
    } else if (dayIsTomorrow) {
      forkJoin([
        this.sleepService.changeNextWakeupTime$(wakeupTime),
        this.daybookHttpService.updateDaybookDayItems$(updateItems)
      ]).subscribe({
        next: (a) => { },
        error: (e) => console.log('Error: ', e),
        complete: () => {
          this._isEditingWakeupTime = false;
          this._update();
          this.daybookService.refreshDisplay();
        }
      });
    } else {
      this.daybookHttpService.updateDaybookDayItems$(updateItems).subscribe(complete => {
        this._isEditingWakeupTime = false;
        this._update();
        this.daybookService.refreshDisplay();
      });
    }
  }
  public onClickDiscardWakeup() {
    this._isEditingWakeupTime = false;
    this._update();
  }
  public onClickSaveFallAsleep() {
    const dateYYYYMMDD: string = this.daybookService.activeDateYYYYMMDD;
    const fallAsleepTime: moment.Moment = this.daybookService.sleepDisplayProfile.fallAsleepInput.timeValue;
    const currentVal: moment.Moment = this.daybookService.sleepDisplayProfile.fallAsleepTime;
    const dayItemUpdater: SleepDaybookItemUpdater = new SleepDaybookItemUpdater();
    const dayItems = this.daybookService.daybookController.dayItems;

    const dayIsToday: boolean = moment().format('YYYY-MM-DD') === dateYYYYMMDD;
    const dayIsAfterToday: boolean = moment().format('YYYY-MM-DD') < dateYYYYMMDD;
    const dayIsBeforeToday: boolean = moment().format('YYYY-MM-DD') > dateYYYYMMDD;

    const updateItems = dayItemUpdater.changeFallAsleepTime(dateYYYYMMDD, currentVal, fallAsleepTime, dayItems);
    if (dayIsToday) {
      forkJoin([
        this.sleepService.changeNextFallAsleepTime$(fallAsleepTime),
        this.daybookHttpService.updateDaybookDayItems$(updateItems)
      ]).subscribe({
        next: (a) => { },
        error: (e) => console.log('Error: ', e),
        complete: () => {
          this._isEditingFallAsleepTime = false;
          this._update();
          this.daybookService.refreshDisplay();
        }
      });
    } else if (dayIsAfterToday) {
      //do nothing... not crucial.
      // could add a bedtime property to the daybookDayItem objects.
      this._isEditingFallAsleepTime = false;
      this._update();
    } else if (dayIsBeforeToday) {
      const dayIsYesterday: boolean = moment().subtract(1, 'days').format('YYYY-MM-DD') === dateYYYYMMDD;
      if (dayIsYesterday) {
        forkJoin([
          this.sleepService.changePrevFallAsleepTime$(fallAsleepTime),
          this.daybookHttpService.updateDaybookDayItems$(updateItems)
        ]).subscribe({
          next: (a) => { },
          error: (e) => console.log('Error: ', e),
          complete: () => {
            this._isEditingFallAsleepTime = false;
            this._update();
            this.daybookService.refreshDisplay();
          }
        });
      } else {
        this.daybookHttpService.updateDaybookDayItems$(updateItems).subscribe(complete => {
          this._isEditingFallAsleepTime = false;
          this._update();
          this.daybookService.refreshDisplay();
        });
      }

    }

  }
  public onClickDiscardFallAsleep() {
    this._isEditingFallAsleepTime = false;
    this._update();
  }

  private _update(action?: DaybookUpdateAction) {

    let doUpdate: boolean = true;
    if (action) {
      if (action === DaybookUpdateAction.CLOCK_MINUTE) {
        if (this.isEditingFallAsleepTime || this.isEditingWakeupTime) {
          if (moment().format('YYYY-MM-DD') === this.daybookService.activeDateYYYYMMDD) {
            doUpdate = false;
          }
        }
      }
    }
    if (doUpdate) {
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
      this._wakeupDate = sleepProfile.wakeupTime.format('MMM Do');
      this._sleepAtTime = sleepProfile.fallAsleepTime.format('h:mm a');
      this._sleepAtDate = sleepProfile.fallAsleepTime.format('MMM Do');
      this._wakeupInput = sleepProfile.wakeupInput;
      this._sleepInput = sleepProfile.fallAsleepInput;
    } else {

    }


  }
}
