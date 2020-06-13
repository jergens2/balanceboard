import { Injectable } from '@angular/core';
import { UserPromptType } from '../../user-action-prompt/user-prompt-type.enum';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from '../../serverurl';
import { UserAccountProfile } from './api/user-account-profile.class';
import { map } from 'rxjs/operators';
import { UAPAppConfiguration } from './api/uap-app-configuraiton.interface';
import { UAPAppPreferences } from './api/uap-app-preferences.interface';
import { UAPPersonalInformation } from './api/uap-personal-information.interface';

@Injectable({
  providedIn: 'root'
})
export class UserAccountProfileService {

  constructor(private httpClient: HttpClient) { }

  public get allGood(): boolean { return true; }

  private _userId: string = '';
  private _userProfile$: BehaviorSubject<UserAccountProfile>;

  public get userProfile$(): Observable<UserAccountProfile> { return this._userProfile$.asObservable(); }
  public get userProfile(): UserAccountProfile { return this._userProfile$.getValue(); }
  
  public get appConfig(): UAPAppConfiguration { return this.userProfile.uapAppConfig; }
  public get appPreferences(): UAPAppPreferences { return this.userProfile.uapAppPreferences; }
  public get personalInfo(): UAPPersonalInformation { return this.userProfile.uapPersonalInfo; }

  public initiate$(userId: string): Observable<UserPromptType> {
    this._userId = userId;
    const _prompt$: Subject<UserPromptType> = new Subject();
    this._getUserAccountProfile$().subscribe((profile) => {
      this._userProfile$ = new BehaviorSubject(profile);
      console.log("Profile!" , profile.isValid, profile);
      if (profile.isValid) {
        _prompt$.next();
      } else {
        _prompt$.next(UserPromptType.USER_PROFILE);
      }
    }, (error) => {
      console.log("Error with user profile: ", error);
      _prompt$.next();
    });

    return _prompt$.asObservable();
  }

  public setAppConfig$(config: UAPAppConfiguration): Observable<boolean> {
    console.log("Setting app config")
    this.userProfile.setAppConfig(config);
    const _complete$: Subject<boolean> = new Subject();
    const url = serverUrl + "/api/user-account-profile/save";
    const body = {
      id: this.userProfile.id,
      userId: this._userId,
      userProfile: this.userProfile.userProfileHttp(),
    }
    this.httpClient.post<{ message: string, data: any, success: boolean }>(url, body)
      .subscribe((response) => {
        console.log("Respoinse is: ", response)
        
        if(response.success === true){
          
          const newProfile = new UserAccountProfile(response.data);
          this._userProfile$.next(newProfile);
        }
        _complete$.next(true);
      }, error => {
        console.log("error: ", error)
        _complete$.next(true);
      });
    return _complete$.asObservable();
  }



  private _getUserAccountProfile$(): Observable<UserAccountProfile> {
    const url = serverUrl + "/api/user-account-profile/get";
    return this.httpClient.post<{ message: string, data: any, success: boolean }>(url, { userId: this._userId })
      .pipe<UserAccountProfile>(map((response: {
        message: string,
        success: boolean,
        data: any,
      }) => {
        console.log("Building : ", response)
        if(response.success === true){
          return new UserAccountProfile(response.data);
        }else{
          console.log("success was fail")
          return new UserAccountProfile(null);
        }
      }));
  }

  public logout() {
    this._userId = '';
    this._userProfile$ = null;
  }
}
