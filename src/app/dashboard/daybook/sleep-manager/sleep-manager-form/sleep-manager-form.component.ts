import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { SleepManagerForm } from './sleep-manager-form.class';
import { SleepManagerService } from '../sleep-manager.service';
import { SleepManagerFormActions } from './smfa-actions.enum';

@Component({
  selector: 'app-sleep-manager-form',
  templateUrl: './sleep-manager-form.component.html',
  styleUrls: ['./sleep-manager-form.component.css']
})
export class SleepManagerFormComponent implements OnInit {

  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;

  public get sleepManagerForm(): SleepManagerForm { return this.sleepService.sleepManagerForm; }
  private _sleepManagerFormAction: SleepManagerFormActions = SleepManagerFormActions.WAKEUP_TIME;
  public get smfa(): SleepManagerFormActions { return this._sleepManagerFormAction; }
  public get showBackButton(): boolean { return this.smfa !== SleepManagerFormActions.WAKEUP_TIME; }

  public get smfaWakeupTime(): boolean { return this.smfa === SleepManagerFormActions.WAKEUP_TIME ;}
  public get smfaPreviousFallAsleep(): boolean { return this.smfa === SleepManagerFormActions.PREV_SLEEP_TIME ;}
  public get smfaSleepDuration(): boolean { return this.smfa === SleepManagerFormActions.SLEEP_DURATION;}
  // public get smfaEnergy(): boolean { return this.smfa === SleepManagerFormActions.ENERGY_WAKEUP ;}
  public get smfaBedtime(): boolean { return this.smfa === SleepManagerFormActions.BEDTIME ;}
  public get smfaDreams(): boolean { return this.smfa === SleepManagerFormActions.DREAMS ;}


  public get wakeupTimeIsSet(): boolean { return this.sleepManagerForm.wakeupTimeIsSet; }
  public get prevFallAsleepTimeIsSet(): boolean { return this.sleepManagerForm.prevFallAsleepTimeIsSet; }
  public get wakeupTime(): moment.Moment { return this.sleepManagerForm.formInputWakeupTime; }
  public get prevFallAsleepTime(): moment.Moment { return this.sleepManagerForm.formInputPrevFallAsleep; }

  constructor(private sleepService: SleepManagerService) { }

  ngOnInit(): void {

    this.sleepManagerForm.formActionChanged$.subscribe((change: SleepManagerFormActions)=>{
      this._sleepManagerFormAction = change;
    })
  }


  
  public onClickBack() { this.sleepManagerForm.onClickBack(); }
  public onClickForward() { this.sleepManagerForm.onClickForward(); }

}
