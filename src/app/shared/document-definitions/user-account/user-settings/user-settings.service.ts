import { Injectable } from '@angular/core';
import { UserSetting } from './user-setting.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { serverUrl } from '../../../../serverurl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { defaultUserSettings } from './default-user-settings';
import { ServiceAuthenticates } from '../../../../authentication/service-authentication-garbage/service-authenticates.interface';
import { ServiceAuthenticationAttempt } from '../../../../authentication/service-authentication-garbage/service-authentication-attempt.interface';


@Injectable({
  providedIn: 'root'
})
export class UserSettingsService implements ServiceAuthenticates{

  constructor(private httpClient: HttpClient) { }

  /*
    you cannot have two services each with a reference to one another, becuase this is circular.
    auth service already has userSettings Service, therefore this service cannot have an auth service property,
    therefore, this service must do the HTTP requests for updating usersettings.

  */

  private _userId: string;
  private _userSettings$: BehaviorSubject<UserSetting[]> = new BehaviorSubject<UserSetting[]>([]);
  get userSettings$(): Observable<UserSetting[]> {
    return this._userSettings$.asObservable();
  }
  set userSettings( userSettings: UserSetting[]){ 
    // this._userSettings = userSettings;
    this._userSettings$.next(userSettings);
  }

  private serverUrl: string = serverUrl;




  private _loginComplete$: BehaviorSubject<ServiceAuthenticationAttempt> = new BehaviorSubject({
    authenticated: false, message: '',
  });
  public synchronousLogin(userId: string): boolean { 
    this._userId = userId;
    return true;
  }
  login$(userId: string): Observable<ServiceAuthenticationAttempt>{
    return null;
  }
  logout(){
    this._userId = null;
    this._userSettings$.next([]);
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

  // user.userSettings = currentSettings;

    // this.httpClient.post<{ message: string, data: any }>(settingsPostUrl, user, httpOptions)
    //   .pipe<UserAccount>(map((response) => {
    //     let updatedUser = new UserAccount(response.data._id, response.data.email, response.data.socialId, response.data.userSettings);
    //     return updatedUser;
    //   }))
    //   .subscribe((updatedUser: UserAccount)=>{
    //     // this.userSettings = updatedUser.userSettings;
    //   })

  }



}
