import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { SleepBatteryConfiguration } from '../sleep-battery/sleep-battery-configuration.interface';
import { faBed, faPlusCircle, faMinusCircle, faExclamationTriangle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { SleepService } from '../../sleep-manager/sleep.service';
import { DaybookDisplayService } from '../../daybook-display.service';
import { DaybookDayItem } from '../../daybook-day-item/daybook-day-item.class';

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

  public get wakeupLabel(): string { return this._wakeupLabel; }
  public get wakeupDate(): string { return this._wakeupDate; }
  public get wakeupTime(): string { return this._wakeupTime; }

  public get bedtimeLabel(): string { return this._sleepAtLabel; }
  public get bedtimeDate(): string { return this._sleepAtDate; }
  public get bedtime(): string { return this._sleepAtTime; }


  ngOnInit() {
    this._update();
    this.daybookService.displayUpdated$.subscribe(update => {
      this._update();
    });
  }

  public onWakeupTimeChanged(time: moment.Moment) {

  }

  private _update() {
    const todayYYYYMMDD: string = moment().format('YYYY-MM-DD');
    const currentDateYYYYMMDD: string = this.daybookService.activeDateYYYYMMDD;
    const dayItems: DaybookDayItem[] = this.daybookService.daybookController.dayItems;
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
    const wakeup: moment.Moment = this.sleepService.sleepManager.findPreviousWakeupTimeForDate(currentDateYYYYMMDD, dayItems);
    const sleepAt: moment.Moment = this.sleepService.sleepManager.findNextFallAsleepTimeForDate(currentDateYYYYMMDD, dayItems);
    this._wakeupTime = wakeup.format('h:mm a');
    this._wakeupDate = wakeup.format('YYYY-MM-DD');
    this._sleepAtTime = sleepAt.format('h:mm a');
    this._sleepAtDate = sleepAt.format('YYYY-MM-DD');
  }
}
