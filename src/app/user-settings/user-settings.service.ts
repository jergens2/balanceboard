import { Injectable } from '@angular/core';
import { UserSetting } from './user-setting.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  
  private _userSettings: BehaviorSubject<UserSetting[]> = new BehaviorSubject<UserSetting[]>([]);
  get userSettings(): Observable<UserSetting[]> { 
    return this._userSettings.asObservable();
  } 



  constructor() { }



  changeSetting(setting: UserSetting){
    let currentSettings:UserSetting[] = this._userSettings.getValue();


  }

}
