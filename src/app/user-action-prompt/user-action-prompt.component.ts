import { Component, OnInit } from '@angular/core';
import { UserActionPromptService } from './user-action-prompt.service';
import { UserPromptType } from './user-prompt-type.enum';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-user-action-prompt',
  templateUrl: './user-action-prompt.component.html',
  styleUrls: ['./user-action-prompt.component.css']
})
export class UserActionPromptComponent implements OnInit {

  constructor(private promptService: UserActionPromptService, private authService: AuthenticationService) { }


  private _prompts: UserPromptType[] = [];
  private _currentPrompt: UserPromptType = null;
  public get prompts(): UserPromptType[] { return this._prompts; }

  public get promptIsSleep(): boolean { return this._currentPrompt === UserPromptType.SLEEP_MANAGER; }
  public get promptIsInfo(): boolean { return this._currentPrompt === UserPromptType.INFORMATION_UPDATE; }

  public get showSkipButton(): boolean { return true; }


  ngOnInit() {
    let prompts: UserPromptType[] = this.promptService.prompts;
    if(prompts.length > 0){
      this._currentPrompt = prompts[0];
      // console.log("current pronpt is: ", this._currentPrompt)
      // console.log("This.proimptissleep", this.promptIsSleep)
    }else{
      this.promptService.clearPrompts();
    }


  }

  public onSleepManagerComplete(){
    

    this.promptService.clearSleepPrompt();
  }

  public onClickContinue(){
    this.promptService.clearPrompts();
  }

  public onClickSkip(){
    this.promptService.clearPrompts();
  }

  private _confirmLogout: boolean = false;
  public get confirmLogout(): boolean { return this._confirmLogout; }
  public onClickLogout(){
    this._confirmLogout= true;
  }
  public onMouseLeaveButtons(){
    this._confirmLogout = false;
  }
  public onClickConfirmLogout(){
    this.authService.logout();
  }

}
