import { Injectable } from '@angular/core';
import { UserPromptType } from './user-prompt-type.enum';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserActionPromptService {

  constructor() { }

  private _isFirstTimeUser: boolean = false;

  private _prompts: UserPromptType[] = [];

  public hasPrompts(): boolean { return this._prompts.length > 0; }
  public get prompts(): UserPromptType[] { return this._prompts; }

  public clearPrompts(){
    this._prompts = [];
    this._promptsCleared$.next(true);
  }

  private _promptsCleared$: Subject<boolean> = new Subject();
  public get promptsCleared$(): Observable<boolean>{
    return this._promptsCleared$.asObservable();
  }

}
