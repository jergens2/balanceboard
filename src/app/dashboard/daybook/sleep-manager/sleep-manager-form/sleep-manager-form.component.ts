import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { SleepManagerForm } from './sleep-manager-form.class';
import { SleepManagerService } from '../sleep-manager.service';
import { SleepManagerFormActions } from './smfa-actions.enum';
import { SleepProfileHTTPData } from '../sleep-profile-http-data.interface';
import { DaybookControllerService } from '../../controller/daybook-controller.service';
import * as moment from 'moment';
import { DaybookSleepInputDataItem } from '../../api/data-items/daybook-sleep-input-data-item.interface';

@Component({
  selector: 'app-sleep-manager-form',
  templateUrl: './sleep-manager-form.component.html',
  styleUrls: ['./sleep-manager-form.component.css']
})
export class SleepManagerFormComponent implements OnInit {

  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;
  public faCheck = faCheck;

  public get sleepManagerForm(): SleepManagerForm { return this.sleepService.sleepManagerForm; }
  private _sleepManagerFormAction: SleepManagerFormActions = SleepManagerFormActions.WAKEUP_TIME;
  private _isLoading: boolean = false;
  public get smfa(): SleepManagerFormActions { return this._sleepManagerFormAction; }
  public get showBackButton(): boolean { return this.smfa !== SleepManagerFormActions.WAKEUP_TIME; }
  public get showDurationContainer(): boolean { return !this.smfaBedtime; }

  public get smfaWakeupTime(): boolean { return this.smfa === SleepManagerFormActions.WAKEUP_TIME; }
  public get smfaPreviousFallAsleep(): boolean { return this.smfa === SleepManagerFormActions.PREV_SLEEP_TIME; }
  public get smfaSleepDuration(): boolean { return this.smfa === SleepManagerFormActions.SLEEP_DURATION; }
  public get smfaEnergy(): boolean { return this.smfa === SleepManagerFormActions.ENERGY; }
  public get smfaDreams(): boolean { return this.smfa === SleepManagerFormActions.DREAMS; }
  public get smfaBedtime(): boolean { return this.smfa === SleepManagerFormActions.BEDTIME; }

  public get wakeupTimeIsSet(): boolean { return this.sleepManagerForm.wakeupTimeIsSet; }
  public get prevFallAsleepTimeIsSet(): boolean { return this.sleepManagerForm.prevFallAsleepTimeIsSet; }
  public get durationIsSet(): boolean { return this.sleepManagerForm.durationIsSet; }
  public get wakeupTime(): moment.Moment { return this.sleepManagerForm.formInputWakeupTime; }
  public get prevFallAsleepTime(): moment.Moment { return this.sleepManagerForm.formInputPrevFallAsleep; }
  public get sleepDuration(): string { return this.sleepManagerForm.durationString; }
  public get sleepPeriodDuration(): string { return this.sleepManagerForm.sleepPeriodDurationString; }


  public get proceedNormally(): boolean { return !this.smfaBedtime; }
  public get finalAction(): boolean { return this.smfaBedtime; }

  public get isLoading(): boolean { return this._isLoading; }



  constructor(private sleepService: SleepManagerService, private daybookService: DaybookControllerService) { }

  ngOnInit(): void {

    this.sleepManagerForm.formActionChanged$.subscribe((change: SleepManagerFormActions) => {
      this._sleepManagerFormAction = change;
    });
    this.sleepManagerForm.finalize$.subscribe((finalize) => {
      this._finalize();
    });
  }



  public onClickBack() { this.sleepManagerForm.onClickBack(); }
  public onClickForward() { this.sleepManagerForm.onClickForward(); }


  private _finalize() {
    this._isLoading = true;
    // console.log("\n\n***Finalizing")
    // console.log("Wakeup time: ", this.sleepManagerForm.formInputWakeupTime.format('YYYY-MM-DD hh:mm a'));
    // console.log("Prev fall asleep time: ", this.sleepManagerForm.formInputPrevFallAsleep.format('YYYY-MM-DD hh:mm a'));
    // console.log("Duration percent: ", this.sleepManagerForm.formInputDurationPercent);


    // console.log("Energy: ", this.sleepManagerForm.formInputStartEnergyPercent);
    // console.log("dreams: ", this.sleepManagerForm.formInputDreams);
    // console.log("activities: ", this.sleepManagerForm.formInputActivities);

    // console.log("bed time: ", this.sleepManagerForm.formInputFallAsleepTime.format('YYYY-MM-DD hh:mm a'));
    // console.log("next wakeup: ", this.sleepManagerForm.formInputNextWakeup.format('YYYY-MM-DD hh:mm a'));

    const prevFallAsleepTime: string = this.sleepManagerForm.formInputPrevFallAsleep.toISOString();
    const prevFallAsleepUTCOffset: number = this.sleepManagerForm.formInputPrevFallAsleep.utcOffset();
    const previousWakeupTime: string = this.sleepManagerForm.formInputWakeupTime.toISOString();
    const previousWakeupUTCOffset: number = this.sleepManagerForm.formInputWakeupTime.utcOffset();
    const energyAtWakeup: number = this.sleepManagerForm.formInputStartEnergyPercent;
    const nextFallAsleepTime: string = this.sleepManagerForm.formInputFallAsleepTime.toISOString();
    const nextFallAsleepTimeUTCOffset: number = this.sleepManagerForm.formInputFallAsleepTime.utcOffset();
    const nextWakeupTime: string = this.sleepManagerForm.formInputNextWakeup.toISOString();
    const nextWakeupUTCOffset: number = this.sleepManagerForm.formInputNextWakeup.utcOffset();
    const durationPercent: number = this.sleepManagerForm.formInputDurationPercent;


    let data: SleepProfileHTTPData = {
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
    }
    let sleepTimes: {}


    let prevDaySleepItems: DaybookSleepInputDataItem[] = [];
    let thisDaySleepItems: DaybookSleepInputDataItem[] = [];
    const startOfThisDay = moment().startOf('day');
    if (moment(prevFallAsleepTime).isBefore(startOfThisDay)) {
      prevDaySleepItems = [
        {
          startSleepTimeISO: prevFallAsleepTime,
          startSleepTimeUtcOffsetMinutes: prevFallAsleepUTCOffset,
          endSleepTimeISO: startOfThisDay.toISOString(),
          endSleepTimeUtcOffsetMinutes: startOfThisDay.utcOffset(),
          percentAsleep: durationPercent,
          embeddedNote: '',
          activities: [],
          energyAtEnd: -1,
        },
      ];
      thisDaySleepItems = [
        {
          startSleepTimeISO: startOfThisDay.toISOString(),
          startSleepTimeUtcOffsetMinutes: startOfThisDay.utcOffset(),
          endSleepTimeISO: previousWakeupTime,
          endSleepTimeUtcOffsetMinutes: previousWakeupUTCOffset,
          percentAsleep: durationPercent,
          embeddedNote: '',
          activities: [],
          energyAtEnd: energyAtWakeup,
        },
      ]
    }else{
      thisDaySleepItems = [
        {
          startSleepTimeISO: prevFallAsleepTime,
          startSleepTimeUtcOffsetMinutes: prevFallAsleepUTCOffset,
          endSleepTimeISO: previousWakeupTime,
          endSleepTimeUtcOffsetMinutes: previousWakeupUTCOffset,
          percentAsleep: durationPercent,
          embeddedNote: '',
          activities: [],
          energyAtEnd: energyAtWakeup,
        },
      ]
    }
    this.daybookService.todayController.setSleepEntryItems(prevDaySleepItems, thisDaySleepItems);
    this.daybookService.saveTodayControllerChanges$().subscribe((saved)=>{
      if(saved === true){
        this.sleepService.updateSleepProfile$(data);
      }else{
        console.log('Error saving...')
      }
    });
  }

}
