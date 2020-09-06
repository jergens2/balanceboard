import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { SleepCycleHTTPData } from '../../sleep-cycle/sleep-cycle-http-data.interface';
import * as moment from 'moment';
import { SleepService } from '../../sleep.service';
import { SleepDaybookItemUpdater } from './sleep-daybook-item-updater.class';
import { UserAccountProfileService } from '../../../../user-account-profile/user-account-profile.service';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { DaybookHttpService } from '../../../api/daybook-http.service';
import { UserActionPromptService } from '../../../../../nav/user-action-prompt/user-action-prompt.service';
import { forkJoin, timer } from 'rxjs';
import { SleepManager } from '../../sleep-manager.class';
import { DurationString } from '../../../../../shared/time-utilities/duration-string.class';
import { TimeInput } from '../../../../../shared/components/time-input/time-input.class';
import { TimeUnitConverter } from '../../../../../shared/time-utilities/time-unit-converter.class';
import { TimeUnit } from '../../../../../shared/time-utilities/time-unit.enum';
import { AuthenticationService } from '../../../../../authentication/authentication.service';
import { SleepDataForm } from './sleep-data-form.class';

@Component({
  selector: 'app-sleep-data-form',
  templateUrl: './sleep-data-form.component.html',
  styleUrls: ['./sleep-data-form.component.css']
})
export class SleepDataFormComponent implements OnInit {

  public readonly faArrowLeft = faArrowLeft;
  public readonly faCheck = faCheck;

  private _isLoading = false;
  private _showFormList = true;
  private _sleepDataFormDisplay: SleepDataForm;

  public get isLoading(): boolean { return this._isLoading; }
  public get showFormList(): boolean { return this._showFormList; }

  public get sleepManager(): SleepManager { return this._sleepService.sleepManager; }
  public get hasPreviousActivity(): boolean { return this.sleepManager.hasPreviousActivity; }

  public get sdfDisplay(): SleepDataForm { return this._sleepDataFormDisplay; }
  public get previousActivityTime(): moment.Moment { return this.sdfDisplay.previousActivityTime; }
  public get previousFallAsleepTime(): moment.Moment { return this.sdfDisplay.previousFallAsleepTime; }
  public get previousWakeupTime(): moment.Moment { return this.sdfDisplay.previousWakeupTime; }
  public get nowTime(): moment.Moment { return this.sdfDisplay.nowTime; }
  public get nextFallAsleepTime(): moment.Moment { return this.sdfDisplay.nextFallAsleepTime; }
  public get nextWakeupTime(): moment.Moment { return this.sdfDisplay.nextWakeupTime; }
  public get previousVacantDuration(): string { return this.sdfDisplay.previousVacantDuration; }
  public get previousSleepDuration(): string { return this.sdfDisplay.previousSleepDuration; }
  public get awakeForDuration(): string { return this.sdfDisplay.awakeForDuration; }
  public get timeUntilSleepDuration(): string { return this.sdfDisplay.timeUntilSleepDuration; }
  public get nextSleepDuration(): string { return this.sdfDisplay.nextSleepDuration; }
  public get previousVacantDurationHours(): number { return this.sdfDisplay.previousVacantDurationHours; }
  public get previousSleepDurationHours(): number { return this.sdfDisplay.previousSleepDurationHours; }
  public get awakeForDurationHours(): number { return this.sdfDisplay.awakeForDurationHours; }
  public get timeUntilSleepDurationHours(): number { return this.sdfDisplay.timeUntilSleepDurationHours; }
  public get nextSleepDurationHours(): number { return this.sdfDisplay.nextSleepDurationHours; }
  public get prevFallAsleepTimeInput(): TimeInput { return this.sdfDisplay.prevFallAsleepTimeInput; }
  public get prevWakeupTimeInput(): TimeInput { return this.sdfDisplay.prevWakeupTimeInput; }
  public get nextFallAsleepTimeInput(): TimeInput { return this.sdfDisplay.nextFallAsleepTimeInput; }
  public get nextWakeupTimeInput(): TimeInput { return this.sdfDisplay.nextWakeupTimeInput; }
  public get energyAtWakeup(): number { return this.sdfDisplay.energyAtWakeup; }
  public get sleepDurationPercent(): number { return this.sdfDisplay.sleepDurationPercent; }

  public onClickLogout() { this._authService.logout(); }
  public onClickFinish() { this._finalize(); }

  constructor(
    private _sleepService: SleepService,
    private _userProfileService: UserAccountProfileService,
    private _daybookHttpService: DaybookHttpService,
    private _userPromptService: UserActionPromptService,
    private _authService: AuthenticationService) { }

  ngOnInit(): void {
    this._sleepDataFormDisplay = new SleepDataForm(this.sleepManager);
  }

  private _finalize() {
    this._isLoading = true;
    const prevFallAsleepTime: string = this.previousFallAsleepTime.toISOString();
    const prevFallAsleepUTCOffset: number = this.previousFallAsleepTime.utcOffset();
    const previousWakeupTime: string = this.previousWakeupTime.toISOString();
    const previousWakeupUTCOffset: number = this.previousWakeupTime.utcOffset();
    const energyAtWakeup: number = this.energyAtWakeup;
    const nextFallAsleepTime: string = this.nextFallAsleepTime.toISOString();
    const nextFallAsleepTimeUTCOffset: number = this.nextFallAsleepTime.utcOffset();
    const nextWakeupTime: string = this.nextWakeupTime.toISOString();
    const nextWakeupUTCOffset: number = this.nextWakeupTime.utcOffset();
    const durationPercent: number = this.sleepDurationPercent;
    const data: SleepCycleHTTPData = {
      _id: '',
      userId: '',
      previousFallAsleepTime: prevFallAsleepTime,
      previousFallAsleepUTCOffset: prevFallAsleepUTCOffset,
      previousWakeupTime: previousWakeupTime,
      previousWakeupUTCOffset: previousWakeupUTCOffset,
      energyAtWakeup: energyAtWakeup,
      nextFallAsleepTime: nextFallAsleepTime,
      nextFallAsleepUTCOffset: nextFallAsleepTimeUTCOffset,
      nextWakeupTime: nextWakeupTime,
      nextWakeupUTCOffset: nextWakeupUTCOffset,
    };

    const daybookUpdater: SleepDaybookItemUpdater = new SleepDaybookItemUpdater();
    const profile = this._userProfileService.userProfile;
    const dayItems = this._daybookHttpService.dayItems;
    const updateDaybookItems: DaybookDayItem[] = daybookUpdater.updateDaybookItems(this.sdfDisplay, profile, dayItems);

    forkJoin([
      this._daybookHttpService.updateDaybookDayItems$(updateDaybookItems),
      this._sleepService.saveSleepProfileChanges$(data),
    ]).subscribe({
      next: (a) => { },
      error: (e) => console.log('Error loading: ', e),
      complete: () => {
        console.log('We are complete.');
        this._userPromptService.clearSleepPrompt();
      }
    });

  }



}
