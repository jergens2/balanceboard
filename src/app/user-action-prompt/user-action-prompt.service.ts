import { Injectable } from '@angular/core';
import { UserPromptType } from './user-prompt-type.enum';
import { Observable, Subject } from 'rxjs';
import { UserAccountProfileService } from '../dashboard/user-account-profile/user-account-profile.service';
import { SleepManagerService } from '../dashboard/daybook/sleep-manager/sleep-manager.service';

@Injectable({
  providedIn: 'root'
})
  /**
   * The UserActionPromptService class is similar to the AUthenticationService, 
   * where, it will prevent the loading of the app until its conditions are satisfied.
   */
export class UserActionPromptService {


  constructor(
    private accountService: UserAccountProfileService,
    private sleepService: SleepManagerService
  ) { }

  private _isFirstTimeUser: boolean = false;

  private _prompts: UserPromptType[] = [];

  private _loadingComplete$: Subject<boolean> = new Subject();
  public initiate$(userId: string): Observable<boolean>{
    let prompts: UserPromptType[] = [];

    this.accountService.allGood;

    const sleepPrompt = this.sleepService.initiate$(userId).subscribe((userActionRequired: boolean)=>{
      if(userActionRequired === true){
        this._prompts.push(UserPromptType.SLEEP_MANAGER);
      }else{

      }
      this._loadingComplete$.next(true);
    });

    return this._loadingComplete$.asObservable();
  }

  public hasPrompts(): boolean { return this._prompts.length > 0; }
  public get prompts(): UserPromptType[] { return this._prompts; }

  public clearPrompts(){
    this._prompts = [];
    this._promptsCleared$.next(true);
  }

  public clearSleepPrompt(){
    const sleepIndex = this.prompts.findIndex(item => item === UserPromptType.SLEEP_MANAGER);
    if(sleepIndex > -1){
      this._prompts.splice(sleepIndex, 1);
    }
    if(this._prompts.length === 0){
      this._promptsCleared$.next(true);
    }
  }

  private _promptsCleared$: Subject<boolean> = new Subject();
  public get promptsCleared$(): Observable<boolean>{
    return this._promptsCleared$.asObservable();
  }


  public logout(){
    this._prompts = [];
    this.sleepService.logout();
  }

}
