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
import { DaybookDayItemSleepProfileData } from '../../api/data-items/daybook-day-item-sleep-profile-data.interface';
import { Subscription, timer } from 'rxjs';
import { DaybookSleepProfile } from '../../api/controllers/daybook-sleep-profile.class';
import { RoundToNearestMinute } from '../../../../shared/utilities/time-utilities/round-to-nearest-minute.class';
import { DaybookTimeReferencer } from '../../api/controllers/daybook-time-referencer.class';

@Component({
  selector: 'app-sleep-profile-widget',
  templateUrl: './sleep-profile-widget.component.html',
  styleUrls: ['./sleep-profile-widget.component.css']
})
export class SleepProfileWidgetComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }


  public sleepProfileForm: FormGroup;
  private _batteryConfiguration: SleepBatteryConfiguration;
  public get batteryConfiguration(): SleepBatteryConfiguration { return this._batteryConfiguration; }





  ngOnInit() {
    this.daybookService.activeDay$.subscribe((dayChanged) => { 
      console.log("SLEEP PROFILE WIDGET: REINITIATING  - " + dayChanged.dateYYYYMMDD);
      this.reInitiate();
    });
  }

  public onWakeupTimeChanged(time: moment.Moment){

  }

  private reInitiate() {
    const timeReferencer: DaybookTimeReferencer = this.daybookService.activeDay.timeReferencer;
    // this.wakeupTime = timeReferencer.determineWakeupTime();
    // this.previousFallAsleepTime = timeReferencer.previousDayFallAsleepTime;
    // this.bedTime = timeReferencer.thisDayBedTime;
    // this.thisDayFallAsleepTime = timeReferencer.thisDayFallAsleepTime;
  }



}
