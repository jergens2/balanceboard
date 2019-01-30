import { Injectable } from '@angular/core';
import { UserSetting } from './user-setting.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { serverUrl } from '../serverurl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../authentication/authentication.service';
import { User } from '../authentication/user.model';
import { map } from 'rxjs/operators';
import { defaultUserSettings } from './default-user-settings';
import { AuthStatus } from '../authentication/auth-status.model';


@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  constructor(private httpClient: HttpClient) { }

  /*
    you cannot have two services each with a reference to one another, becuase this is circular.
    auth service already has userSettings Service, therefore this service cannot have an auth service property,
    therefore, this service must do the HTTP requests for updating usersettings.

  */

  private _authStatus: AuthStatus;
  // private _userSettings: UserSetting[] = [];
  private _userSettings$: BehaviorSubject<UserSetting[]> = new BehaviorSubject<UserSetting[]>([]);
  get userSettings$(): Observable<UserSetting[]> {
    return this._userSettings$.asObservable();
  }
  set userSettings( userSettings: UserSetting[]){ 
    // this._userSettings = userSettings;
    this._userSettings$.next(userSettings);
  }

  private serverUrl: string = serverUrl;




  login(authStatus: AuthStatus){
    this._authStatus = authStatus;
    console.log("login(): setting user settings to ", this._authStatus.user.userSettings);
    this.userSettings = this._authStatus.user.userSettings;
  }


  createDefaultSettings(): UserSetting[]{
    
    let defaultSettings: UserSetting[] = defaultUserSettings;
    return defaultSettings;
  }



  saveSetting(changedSetting: UserSetting){ 
    let currentSettings = this._userSettings$.getValue()
    for(let setting of currentSettings){
      if(setting.name == changedSetting.name){
        setting.booleanValue = changedSetting.booleanValue;
        setting.numericValue = changedSetting.numericValue;
        setting.stringValue = changedSetting.stringValue;
      }
    }

    this.saveSettings(currentSettings);
  } 

  private saveSettings(currentSettings: UserSetting[]) {
    const settingsPostUrl: string = this.serverUrl + "/api/user/save_settings";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    let user = this._authStatus.user;
    user.userSettings = currentSettings;

    this.httpClient.post<{ message: string, data: any }>(settingsPostUrl, user, httpOptions)
      .pipe<User>(map((response) => {
        let updatedUser = new User(response.data._id, response.data.email, response.data.userSettings);
        return updatedUser;
      }))
      .subscribe((updatedUser: User)=>{
        this.userSettings = updatedUser.userSettings;
      })

  }



}
