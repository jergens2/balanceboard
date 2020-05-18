import { Component, OnInit } from '@angular/core';
import { SleepProfileActions } from './sleep-profile-actions.enum';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { SleepManagerService } from './sleep-manager.service';
import { SleepCyclePosition } from './sleep-cycle-position.enum';
import { DaybookControllerService } from '../controller/daybook-controller.service';
import { faCloudMoon } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sleep-manager',
  templateUrl: './sleep-manager.component.html',
  styleUrls: ['./sleep-manager.component.css']
})
export class SleepManagerComponent implements OnInit {

  constructor(private sleepService: SleepManagerService, private daybookService: DaybookControllerService) { }


  public faCloudMoon = faCloudMoon;


  public get sleepCyclePosition(): SleepCyclePosition { return this.sleepService.sleepManager.currentPosition; }

  private _currentTime: moment.Moment;
  public get currentTime(): string { return this._currentTime.format('h:mm:ss a'); }
  public get currentDate(): string { return this._currentTime.format('dddd, MMM Do, YYYY') }


  public get isAfterBedtime(): boolean { return this.sleepCyclePosition === SleepCyclePosition.AFTER_BEDTIME; }
  public get isSleepTime(): boolean { return this.sleepCyclePosition === SleepCyclePosition.SLEEP; }
  public get isEarlyWakeup(): boolean { return this.sleepCyclePosition === SleepCyclePosition.EARLY_WAKEUP; }
  public get newDataRequired(): boolean { return this.sleepService.sleepManager.dataUpdateRequired; }

  

  /**
   * app lifecycle of this component:
   * 
   * AppComponent initiates the UserActionPromptService, which initiates the SleepManagerService,
   * and then checks to see if UserActionPromptService has any required user inputs.
   * If the SleepManagerService needs data, this will create a prompt in UserActionPromptService, which will cause AppComponent to load this component.
   */
  ngOnInit(): void {
    this._startClock();
    const lastActivityTime = this.daybookService.getLastActivityTime();
    console.log("SleepmanagerComponent OnInit complete")

  }

  private _startClock() {
    this._currentTime = moment();
    const endOfSecond = moment(this._currentTime).endOf('second');
    const msDiff = moment(endOfSecond).diff(this._currentTime, 'milliseconds');
    timer(msDiff, 1000).subscribe((tick) => {
      this._currentTime = moment();
    });
  }





}
