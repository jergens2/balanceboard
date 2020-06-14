import { Injectable } from '@angular/core';
import { UserPromptType } from './user-prompt-type.enum';
import { Observable, Subject, forkJoin, Subscription, BehaviorSubject } from 'rxjs';
import { UserAccountProfileService } from '../dashboard/user-account-profile/user-account-profile.service';
import { SleepManagerService } from '../dashboard/daybook/sleep-manager/sleep-manager.service';
import { map } from 'rxjs/operators';

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


  private _prompts$: BehaviorSubject<UserPromptType[]>;

  private _loadingComplete$: Subject<boolean> = new Subject();
  public initiate$(userId: string): Observable<boolean> {
    const _prompts$ = new BehaviorSubject<UserPromptType[]>([]);
    const initAccountSub = this.accountService.initiate$(userId).subscribe((prompt: UserPromptType) => {
      const addPrompts: UserPromptType[] = [];
      if (prompt) {
        addPrompts.push(prompt);
      }

      const sleepPrompt = this.sleepService.initiate$(userId).subscribe((prompt: UserPromptType) => {
        if (prompt) {
          addPrompts.push(prompt);
        }
        _prompts$.next(addPrompts);
        this._prompts$ = _prompts$;
        this._loadingComplete$.next(true);
      });
    });
    return this._loadingComplete$.asObservable();
  }

  public get prompts$(): Observable<UserPromptType[]> { return this._prompts$.asObservable(); }
  public get prompts(): UserPromptType[] { return this._prompts$.getValue(); }
  public hasPrompts(): boolean { return this.prompts ? this.prompts.length > 0 : false; }
  private _promptsCleared$: Subject<boolean> = new Subject();
  public get promptsCleared$() { return this._promptsCleared$.asObservable(); }

  public clearPrompts() {
    this._prompts$.next([]);
    this._promptsCleared$.next(true);
  }

  public clearSleepPrompt() {
    const currentArray = Object.assign([], this.prompts);
    const sleepIndex = currentArray.findIndex(item => item === UserPromptType.SLEEP_MANAGER);
    if (sleepIndex > -1) {
      currentArray.splice(sleepIndex, 1);
    }
    this._prompts$.next(currentArray);
    if(currentArray.length === 0){
      this.clearPrompts();
    }
  }
  public clearConfigPrompt() {
    const currentArray = Object.assign([], this.prompts);
    const configIndex = currentArray.findIndex(item => item === UserPromptType.USER_PROFILE);
    if (configIndex > -1) {
      currentArray.splice(configIndex, 1);
    }
    this._prompts$.next(currentArray);
    if(currentArray.length === 0){
      this.clearPrompts();
    }
  }




  public logout() {
    if(this._prompts$){
      this._prompts$.next([]);
    }
    this.sleepService.logout();
    this.accountService.logout();
  }

}
