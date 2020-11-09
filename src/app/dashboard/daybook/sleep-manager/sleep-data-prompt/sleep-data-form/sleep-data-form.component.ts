import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faArrowRight, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { SleepCycleHTTPData } from '../../sleep-cycle/sleep-cycle-http-data.interface';
import * as moment from 'moment';
import { SleepService } from '../../sleep.service';
import { SleepDaybookItemUpdater } from './sleep-daybook-item-updater.class';
import { UserAccountProfileService } from '../../../../user-account-profile/user-account-profile.service';
import { DaybookDayItem } from '../../../daybook-day-item/daybook-day-item.class';
import { DaybookHttpService } from '../../../daybook-day-item/daybook-http.service';
import { UserActionPromptService } from '../../../../../nav/user-action-prompt/user-action-prompt.service';
import { forkJoin, timer } from 'rxjs';
import { SleepManager } from '../../sleep-manager.class';
import { DurationString } from '../../../../../shared/time-utilities/duration-string.class';
import { TimeInput } from '../../../../../shared/components/time-input/time-input.class';
import { TimeUnitConverter } from '../../../../../shared/time-utilities/time-unit-converter.class';
import { TimeUnit } from '../../../../../shared/time-utilities/time-unit.enum';
import { AuthenticationService } from '../../../../../authentication/authentication.service';
import { SleepDataForm } from './sleep-data-form.class';
import { DaybookTimelogEntryDataItem } from '../../../daybook-day-item/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivityDisplayItem } from '../../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-activity-display-item.class';
import { ActivityHttpService } from '../../../../activities/api/activity-http.service';
import { TLEFActivityListItem } from '../../../widgets/timelog/timelog-entry-form/tlef-parts/tlef-modify-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';
import { TimelogEntryItem } from '../../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-sleep-data-form',
  templateUrl: './sleep-data-form.component.html',
  styleUrls: ['./sleep-data-form.component.css']
})
export class SleepDataFormComponent implements OnInit {

  public readonly faArrowLeft = faArrowLeft;
  public readonly faCheck = faCheck;
  public readonly faPlus = faPlus

  private _isLoading = false;
  private _showFormList = true;
  private _sleepDataFormDisplay: SleepDataForm;
  private _displayActivities: TimelogEntryActivityDisplayItem[] = [];
  private _showAddButton: boolean = true;
  private _showTLEForm: boolean = false;
  private _timelogEntryActivities: TLEFActivityListItem[] = [];

  public get isLoading(): boolean { return this._isLoading; }
  public get showFormList(): boolean { return this._showFormList; }

  public get sleepManager(): SleepManager { return this._sleepService.sleepManager; }
  public get hasPreviousActivity(): boolean { return this.sleepManager.hasPreviousActivity; }
  public get previousActivity(): DaybookTimelogEntryDataItem { return this.sleepManager.previousActivity; }
  public get displayActivities(): TimelogEntryActivityDisplayItem[] { return this._displayActivities; }
  public get showAddButton(): boolean { return this._showAddButton; }
  public get showTLEForm(): boolean { return this._showTLEForm; }

  public get sdfDisplay(): SleepDataForm { return this._sleepDataFormDisplay; }
  public get hasAvailableTime(): boolean { return this.sdfDisplay.hasAvailableTime; }
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
  public get newTLEStartTimeInput(): TimeInput { return this.sdfDisplay.newTLEStartTimeInput; }
  public get newTLEEndTimeInput(): TimeInput { return this.sdfDisplay.newTLEEndTimeInput; }

  public get energyAtWakeup(): number { return this.sdfDisplay.energyAtWakeup; }
  public get sleepDurationPercent(): number { return this.sdfDisplay.sleepDurationPercent; }

  public onClickLogout() { this._authService.logout(); }
  public onClickFinish() { this._finalize(); }

  constructor(
    private _sleepService: SleepService,
    private _userProfileService: UserAccountProfileService,
    private _daybookHttpService: DaybookHttpService,
    private _userPromptService: UserActionPromptService,
    private _authService: AuthenticationService,
    private _activityService: ActivityHttpService,) { }

  ngOnInit(): void {
    this._sleepDataFormDisplay = new SleepDataForm(this.sleepManager);
    this._setPrevActivity();
  }

  public onClickAddActivities() {
    this._showAddButton = false;
    this._showTLEForm = true;
  }
  public onCancelActivities() {
    this._showAddButton = true;
    this._showTLEForm = false;
  }

  public updateTimelogEntry(activities: TLEFActivityListItem[]) {
    this._timelogEntryActivities = activities;
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

    let addTimelogEntries: TimelogEntryItem[] = [];
    if (this._timelogEntryActivities.length > 0) {

      const start: moment.Moment = moment(this.newTLEStartTimeInput.timeValue);
      const end: moment.Moment = moment(this.newTLEEndTimeInput.timeValue);
      const startDateYYYYMMDD: string = moment(start).format('YYYY-MM-DD');
      const endDateYYYYMMDD: string = moment(end).format('YYYY-MM-DD');

      if (startDateYYYYMMDD === endDateYYYYMMDD) {
        const newTLE = new TimelogEntryItem(start, end);
        newTLE.timelogEntryActivities = this._timelogEntryActivities.map(item => item.toEntryActivity());
        addTimelogEntries = [newTLE];
      } else {
        const midnight: moment.Moment = moment(start).startOf('day').add(24, 'hours');
        const newTLE1 = new TimelogEntryItem(start, midnight);
        const newTLE2 = new TimelogEntryItem(midnight, end);
        newTLE1.timelogEntryActivities = this._timelogEntryActivities.map(item => item.toEntryActivity());
        newTLE2.timelogEntryActivities = this._timelogEntryActivities.map(item => item.toEntryActivity());
        addTimelogEntries = [newTLE1, newTLE2];
      }
    }


    const updateDaybookItems: DaybookDayItem[] = daybookUpdater.updateDaybookItemsForSleepForm(this.sdfDisplay, profile, dayItems, addTimelogEntries);

    forkJoin([
      this._daybookHttpService.updateDaybookDayItems$(updateDaybookItems),
      this._sleepService.saveSleepProfileChangesHTTP$(data),
    ]).subscribe({
      next: (a) => { },
      error: (e) => console.log('Error loading: ', e),
      complete: () => {
        console.log('We are complete.');
        this._userPromptService.clearSleepPrompt();
      }
    });

  }

  private _setPrevActivity() {
    if (this.hasPreviousActivity) {
      let displayActivities: TimelogEntryActivityDisplayItem[] = [];
      const totalMs = moment(this.previousActivity.endTimeISO).diff(this.previousActivity.startTimeISO, 'milliseconds');
      this.previousActivity.timelogEntryActivities.forEach(item => {
        const activity = this._activityService.findActivityByTreeId(item.activityTreeId);
        if (activity) {
          const durationMs = (item.percentage * totalMs) / 100;
          const displayItem = new TimelogEntryActivityDisplayItem(durationMs, activity);
          displayActivities.push(displayItem);
        }
      });
      this._displayActivities = displayActivities;
    }
  }

}
