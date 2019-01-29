import { Injectable } from '@angular/core';
import { UserSetting } from './user-setting.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { serverUrl } from '../serverurl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../authentication/authentication.service';
import { User } from '../authentication/user.model';
import { map } from 'rxjs/operators';
import { defaultUserSettings } from './default-user-settings';


@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {


  private _userSettings: BehaviorSubject<UserSetting[]> = new BehaviorSubject<UserSetting[]>([]);
  get userSettings(): Observable<UserSetting[]> {
    return this._userSettings.asObservable();
  }

  private serverUrl: string = serverUrl;

  constructor(private authService: AuthenticationService, private httpClient: HttpClient) { }


  createDefaultSettings(): UserSetting[]{
    
    let defaultSettings: UserSetting[] = defaultUserSettings;
    return defaultSettings;
  }



  saveNightMode(nightModeSetting: boolean){
    // let currentUser = this.authService.authenticatedUser;
    
    // let settingFound: boolean = false;
    // for(let setting of currentUser.userSettings){
    //   if(setting.name == "night_mode"){
    //     settingFound = true;
    //     setting.booleanValue = nightModeSetting;
    //   }
    // }
    // if(!settingFound){
    //   let setting = new UserSetting("night_mode", false, null, null);
    //   setting.booleanValue = nightModeSetting;
    //   currentUser.userSettings.push(setting);
    // }

    // this.saveSettings(currentUser);
    
  }

  saveSettings(user: User) {
    const settingsPostUrl: string = this.serverUrl + "/api/user/save_settings";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(settingsPostUrl, user, httpOptions)
      .pipe<User>(map((response) => {
        let updatedUser = new User(response.data._id, response.data.email, response.data.userSettings);
        return updatedUser;
      }))
      .subscribe((updatedUser: User)=>{
        this.authService.updateUserSettings(updatedUser);
      })

  }



}
