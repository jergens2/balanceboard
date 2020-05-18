import { Component, OnInit } from '@angular/core';
import { SleepProfileActions } from '../sleep-profile-actions.enum';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sleep-manager-form',
  templateUrl: './sleep-manager-form.component.html',
  styleUrls: ['./sleep-manager-form.component.css']
})
export class SleepManagerFormComponent implements OnInit {

  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;

  private _sleepManagerFormAction: SleepProfileActions = SleepProfileActions.WAKEUP_TIME;
  public get smfa(): SleepProfileActions { return this._sleepManagerFormAction; }
  public get showBackButton(): boolean { return this.smfa !== SleepProfileActions.WAKEUP_TIME; }

  public get smfaWakeupTime(): boolean { return this.smfa === SleepProfileActions.WAKEUP_TIME ;}
  public get smfaPreviousFallAsleep(): boolean { return this.smfa === SleepProfileActions.PREV_FALL_ASLEEP_TIME ;}
  public get smfaSleepDuration(): boolean { return this.smfa === SleepProfileActions.SLEEP_DURATION;}
  public get smfaEnergy(): boolean { return this.smfa === SleepProfileActions.ENERGY_WAKEUP ;}
  public get smfaBedtime(): boolean { return this.smfa === SleepProfileActions.BEDTIME ;}
  public get smfaDreams(): boolean { return this.smfa === SleepProfileActions.DREAMS ;}

  constructor() { }

  ngOnInit(): void {
  }


  
  public onClickBack() {

  }
  public onClickForward() {

  }

}
