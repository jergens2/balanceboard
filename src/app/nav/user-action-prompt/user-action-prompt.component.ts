import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserActionPromptService } from './user-action-prompt.service';
import { UserPromptType } from './user-prompt-type.enum';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Subscription } from 'rxjs';
import { SleepService } from '../../dashboard/daybook/sleep-manager/sleep.service';
import { BackgroundImageService } from '../../shared/background-image.service';

@Component({
  selector: 'app-user-action-prompt',
  templateUrl: './user-action-prompt.component.html',
  styleUrls: ['./user-action-prompt.component.css']
})
export class UserActionPromptComponent implements OnInit, OnDestroy {

  constructor(
    private promptService: UserActionPromptService,
    private sleepService: SleepService, private bgService: BackgroundImageService) { }

  private _prompts: UserPromptType[] = [];
  private _promptSub: Subscription = new Subscription();
  private _currentPrompt: UserPromptType = null;
  private _confirmLogout: boolean = false;
  public get prompts(): UserPromptType[] { return this._prompts; }
  public get promptIsSleep(): boolean { return this._currentPrompt === UserPromptType.SLEEP_MANAGER; }
  public get promptIsInfo(): boolean { return this._currentPrompt === UserPromptType.INFORMATION_UPDATE; }
  public get promptIsConfig(): boolean { return this._currentPrompt === UserPromptType.USER_PROFILE; }
  public get showSkipButton(): boolean { return true; }
  public get confirmLogout(): boolean { return this._confirmLogout; }
  public get backgroundNgClass(): string[] { return this.bgService.ngClass; }

  ngOnInit() {
    this._prompts = this.promptService.prompts;
    this._promptSub = this.promptService.prompts$.subscribe((prompts) => {
      this._prompts = prompts;
      if (this.prompts.length > 0) {
        this._currentPrompt = prompts[0];
      }
    });
  }
  ngOnDestroy() { this._promptSub.unsubscribe(); }

  public onSleepManagerComplete() { this.promptService.clearSleepPrompt(); }
  public onClickContinue() { this.promptService.clearPrompts(); }
  public onConfigComplete() {
    this.promptService.clearConfigPrompt();
    this.sleepService.step3And5InitiateSleepManager();
  }
}
