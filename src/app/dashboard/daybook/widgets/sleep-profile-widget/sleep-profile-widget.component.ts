import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DaybookService } from '../../daybook.service';
import * as moment from 'moment';
import { SleepBatteryConfiguration } from '../sleep-battery/sleep-battery-configuration.interface';
import { faBed, faPlusCircle, faMinusCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

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
    console.log("Is this component necessary?");
    this.daybookService.activeDayController$.subscribe((dayChanged) => { 
      // console.log("SLEEP PROFILE WIDGET: REINITIATING  - " + dayChanged.dateYYYYMMDD);
      this.reInitiate();
    });
  }

  public onWakeupTimeChanged(time: moment.Moment){

  }

  private reInitiate() {


  }



}
