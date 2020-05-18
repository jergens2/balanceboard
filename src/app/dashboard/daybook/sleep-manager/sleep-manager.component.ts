import { Component, OnInit } from '@angular/core';
import { SleepProfileActions } from './sleep-profile-actions.enum';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sleep-manager',
  templateUrl: './sleep-manager.component.html',
  styleUrls: ['./sleep-manager.component.css']
})
export class SleepManagerComponent implements OnInit {

  constructor() { }

  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;

  private _action: SleepProfileActions = SleepProfileActions.WAKEUP_TIME;
  public get action(): SleepProfileActions { return this._action; }

  /**
   * app lifecycle of this component:
   * 
   * AppComponent initiates the UserActionPromptService, which initiates the SleepManagerService,
   * and then checks to see if UserActionPromptService has any required user inputs.
   * If the SleepManagerService needs data, this will create a prompt in UserActionPromptService, which will cause AppComponent to load this component.
   */
  ngOnInit(): void {
    console.log("Does this Oninit?")
  }


  public get showBackButton(): boolean{
    return this._action !== SleepProfileActions.WAKEUP_TIME;
  }

  public onClickBack(){

  }
  public onClickForward(){

  }


}
