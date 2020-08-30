import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { SleepDataForm } from './sleep-data-form.class';
import { SleepDataFormActions } from './sleep-data-form-actions.enum';
import { SleepCycleHTTPData } from '../../sleep-cycle/sleep-cycle-http-data.interface';
import * as moment from 'moment';
import { DaybookSleepInputDataItem } from '../../../api/data-items/daybook-sleep-input-data-item.interface';
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

@Component({
  selector: 'app-sleep-data-form',
  templateUrl: './sleep-data-form.component.html',
  styleUrls: ['./sleep-data-form.component.css']
})
export class SleepDataFormComponent implements OnInit {

  public readonly faArrowLeft = faArrowLeft;
  public readonly faArrowRight = faArrowRight;
  public readonly faCheck = faCheck;

  private _sleepDataFormAction: SleepDataFormActions = SleepDataFormActions.WAKEUP_TIME;
  private _isLoading = false;
  private _showFormList = true;

  private _previousActivityTime: moment.Moment;
  private _previousFallAsleepTime: moment.Moment;
  private _previousWakeupTime: moment.Moment;
  private _nowTime: moment.Moment;
  private _nextFallAsleepTime: moment.Moment;
  private _nextWakeupTime: moment.Moment;

  private _previousVacantDuration: string;
  private _previousSleepDuration: string;
  private _awakeForDuration: string;
  private _timeUntilSleepDuration: string;
  private _nextSleepDuration: string;

  private _previousVacantDurationHours: number;
  private _previousSleepDurationHours: number;
  private _awakeForHours: number;
  private _timeUntilSleepHours: number;
  private _nextSleepDurationHours: number;

  private _prevFallAsleepTimeInput: TimeInput;
  private _prevWakeupTimeInput: TimeInput;
  private _nextFallAsleepTimeInput: TimeInput;
  private _nextWakeupTimeInput: TimeInput;



  public get isLoading(): boolean { return this._isLoading; }
  public get showFormList(): boolean { return this._showFormList; }

  public get prevFallAsleepTimeInput(): TimeInput { return this._prevFallAsleepTimeInput; }
  public get prevWakeupTimeInput(): TimeInput { return this._prevWakeupTimeInput; }
  public get nextFallAsleepTimeInput(): TimeInput { return this._nextFallAsleepTimeInput; }
  public get nextWakeupTimeInput(): TimeInput { return this._nextWakeupTimeInput; }

  public get sleepManager(): SleepManager { return this._sleepService.sleepManager; }

  public get hasPreviousActivity(): boolean { return this.sleepManager.hasPreviousActivity; }
  public get previousActivityTime(): moment.Moment { return this._previousActivityTime; }
  public get previousFallAsleepTime(): moment.Moment { return this._previousFallAsleepTime; }
  public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
  public get nowTime(): moment.Moment { return this._nowTime; }
  public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }
  public get nextWakeupTime(): moment.Moment { return this._nextWakeupTime; }

  public get previousVacantDuration(): string { return this._previousVacantDuration; }
  public get previousSleepDuration(): string { return this._previousSleepDuration; }
  public get awakeForDuration(): string { return this._awakeForDuration; }
  public get timeUntilSleepDuration(): string { return this._timeUntilSleepDuration; }
  public get nextSleepDuration(): string { return this._nextSleepDuration; }

  public get previousVacantDurationHours(): number { return this._previousVacantDurationHours; }
  public get previousSleepDurationHours(): number { return this._previousSleepDurationHours; }
  public get awakeForDurationHours(): number { return this._awakeForHours; }
  public get timeUntilSleepDurationHours(): number { return this._timeUntilSleepHours; }
  public get nextSleepDurationHours(): number { return this._nextSleepDurationHours; }

  public get sleepDataForm(): SleepDataForm { return this._sleepService.sleepDataForm; }
  public get wakeupTimeIsSet(): boolean { return this.sleepDataForm.wakeupTimeIsSet; }
  public get prevFallAsleepTimeIsSet(): boolean { return this.sleepDataForm.prevFallAsleepTimeIsSet; }
  public get durationIsSet(): boolean { return this.sleepDataForm.durationIsSet; }
  public get wakeupTime(): moment.Moment { return this.sleepDataForm.formInputWakeupTime; }
  public get prevFallAsleepTime(): moment.Moment { return this.sleepDataForm.formInputPrevFallAsleep; }
  public get sleepDuration(): string { return this.sleepDataForm.durationString; }
  public get sleepPeriodDuration(): string { return this.sleepDataForm.sleepPeriodDurationString; }



  // public get sdfa(): SleepDataFormActions { return this._sleepDataFormAction; }
  // public get showBackButton(): boolean { return this.sdfa !== SleepDataFormActions.WAKEUP_TIME; }
  // public get showDurationContainer(): boolean { return !this.sdfaBedtime; }
  // public get sdfaWakeupTime(): boolean { return this.sdfa === SleepDataFormActions.WAKEUP_TIME; }
  // public get sdfaPreviousFallAsleep(): boolean { return this.sdfa === SleepDataFormActions.PREV_SLEEP_TIME; }
  // public get sdfaSleepDuration(): boolean { return this.sdfa === SleepDataFormActions.SLEEP_DURATION; }
  // public get sdfaEnergy(): boolean { return this.sdfa === SleepDataFormActions.ENERGY; }
  // public get sdfaDreams(): boolean { return this.sdfa === SleepDataFormActions.DREAMS; }
  // public get sdfaBedtime(): boolean { return this.sdfa === SleepDataFormActions.BEDTIME; }
  // public get proceedNormally(): boolean { return !this.sdfaBedtime; }
  // public get finalAction(): boolean { return this.sdfaBedtime; }

  constructor(
    private _sleepService: SleepService,
    private _userProfileService: UserAccountProfileService,
    private _daybookHttpService: DaybookHttpService,
    private _userPromptService: UserActionPromptService) { }

  ngOnInit(): void {
    this._setValues();

    // this.sleepDataForm.formActionChanged$.subscribe((change: SleepDataFormActions) => {
    //   this._sleepDataFormAction = change;
    // });
    this.sleepDataForm.finalize$.subscribe((finalize) => {
      this._finalize();
    });


  }

  private _finalize() {
    this._isLoading = true;
    const prevFallAsleepTime: string = this.sleepDataForm.formInputPrevFallAsleep.toISOString();
    const prevFallAsleepUTCOffset: number = this.sleepDataForm.formInputPrevFallAsleep.utcOffset();
    const previousWakeupTime: string = this.sleepDataForm.formInputWakeupTime.toISOString();
    const previousWakeupUTCOffset: number = this.sleepDataForm.formInputWakeupTime.utcOffset();
    const energyAtWakeup: number = this.sleepDataForm.formInputStartEnergyPercent;
    const nextFallAsleepTime: string = this.sleepDataForm.formInputFallAsleepTime.toISOString();
    const nextFallAsleepTimeUTCOffset: number = this.sleepDataForm.formInputFallAsleepTime.utcOffset();
    const nextWakeupTime: string = this.sleepDataForm.formInputNextWakeup.toISOString();
    const nextWakeupUTCOffset: number = this.sleepDataForm.formInputNextWakeup.utcOffset();
    const durationPercent: number = this.sleepDataForm.formInputDurationPercent;
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
    const updateDaybookItems: DaybookDayItem[] = daybookUpdater.updateDaybookItems(this.sleepDataForm, profile, dayItems);

    forkJoin([
      this._daybookHttpService.updateDaybookDayItems$(updateDaybookItems),
      this._sleepService.saveSleepProfileChanges$(data),
    ]).subscribe({
      next: (a) => { },
      error: (e) => console.log('Error loading: ', e),
      complete: () => {
        console.log('We are complete.');
      }
    });

  }

  private _setValues() {
    this._previousActivityTime = moment(this.sleepManager.previousActivityTime);
    this._previousFallAsleepTime = moment(this.sleepManager.previousFallAsleepTime);
    this._previousWakeupTime = moment(this.sleepManager.previousWakeupTime);
    this._nextFallAsleepTime = moment(this.sleepManager.nextFallAsleepTime);
    this._nextWakeupTime = moment(this.sleepManager.nextWakeupTime);

    const wakeupColor = 'rgb(255, 179, 0)';
    const sleepColor = 'rgb(0, 43, 99)';

    this._prevFallAsleepTimeInput = new TimeInput(this.previousFallAsleepTime);
    this._prevFallAsleepTimeInput.color = sleepColor;
    this._prevFallAsleepTimeInput.isBold = true;
    this._prevWakeupTimeInput = new TimeInput(this.previousWakeupTime);
    this._prevWakeupTimeInput.color = wakeupColor;
    this._prevWakeupTimeInput.isBold = true;
    this._nextFallAsleepTimeInput = new TimeInput(this.nextFallAsleepTime);
    this._nextFallAsleepTimeInput.color = sleepColor;
    this._nextFallAsleepTimeInput.isBold = true;
    this._nextWakeupTimeInput = new TimeInput(this.nextWakeupTime);
    this._nextWakeupTimeInput.color = wakeupColor;
    this._nextWakeupTimeInput.isBold = true;

    this._prevFallAsleepTimeInput.timeValue$.subscribe(time => {
      this._previousFallAsleepTime = moment(time);
      this._recalculateTimeValues();
    });
    this._prevWakeupTimeInput.timeValue$.subscribe(time => {
      this._previousWakeupTime = moment(time);
      this._recalculateTimeValues();
    });
    this._nextFallAsleepTimeInput.timeValue$.subscribe(time => {
      this._nextFallAsleepTime = moment(time);
      this._recalculateTimeValues();
    });
    this._nextWakeupTimeInput.timeValue$.subscribe(time => {
      this._nextWakeupTime = moment(time);
      this._recalculateTimeValues();
    });

    this._startClock();
    this._recalculateTimeValues();
  }

  private _recalculateTimeValues() {
    const previousVacantMs = moment(this.previousFallAsleepTime).diff(this.previousActivityTime, 'milliseconds');
    const previousSleepMs = moment(this.previousWakeupTime).diff(this.previousFallAsleepTime, 'milliseconds');
    const awakeForMs = moment().diff(this.previousWakeupTime, 'milliseconds');
    const timeUntilSleepMs = moment(this.nextFallAsleepTime).diff(moment(), 'milliseconds');
    const nextSleepDuratoin = moment(this.nextWakeupTime).diff(this.nextFallAsleepTime, 'milliseconds');

    this._previousVacantDuration = DurationString.getDurationStringFromMS(previousVacantMs, true);
    this._previousSleepDuration = DurationString.getDurationStringFromMS(previousSleepMs, true);
    this._awakeForDuration = DurationString.getDurationStringFromMS(awakeForMs, true);
    this._timeUntilSleepDuration = DurationString.getDurationStringFromMS(timeUntilSleepMs, true);
    this._nextSleepDuration = DurationString.getDurationStringFromMS(nextSleepDuratoin, true);

    this._previousVacantDurationHours = TimeUnitConverter.convert(previousVacantMs, TimeUnit.Millisecond, TimeUnit.Hour);
    this._previousSleepDurationHours = TimeUnitConverter.convert(previousSleepMs, TimeUnit.Millisecond, TimeUnit.Hour);
    this._awakeForHours = TimeUnitConverter.convert(awakeForMs, TimeUnit.Millisecond, TimeUnit.Hour);
    this._timeUntilSleepHours = TimeUnitConverter.convert(timeUntilSleepMs, TimeUnit.Millisecond, TimeUnit.Hour);
    this._nextSleepDurationHours = TimeUnitConverter.convert(nextSleepDuratoin, TimeUnit.Millisecond, TimeUnit.Hour);
  }

  private _startClock() {
    this._nowTime = moment();
    const msToNextSecond: number = moment(this._nowTime).startOf('second').add(1, 'seconds').diff(this._nowTime, 'milliseconds');
    timer(msToNextSecond, 1000).subscribe(t => this._nowTime = moment());
  }
}
