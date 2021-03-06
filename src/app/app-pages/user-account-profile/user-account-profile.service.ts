import { Injectable } from '@angular/core';
import { UserPromptType } from '../../nav/user-action-prompt/user-prompt-type.enum';
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


  private _userId: string = '';
  private _userProfile$: BehaviorSubject<UserAccountProfile>;

  public get userProfile$(): Observable<UserAccountProfile> { return this._userProfile$.asObservable(); }
  public get userProfile(): UserAccountProfile { return this._userProfile$.getValue(); }

  public get appConfig(): UAPAppConfiguration { return this.userProfile.uapAppConfig; }
  public get appPreferences(): UAPAppPreferences { return this.userProfile.uapAppPreferences; }
  public get personalInfo(): UAPPersonalInformation { return this.userProfile.uapPersonalInfo; }

  public get hasPrompt(): boolean { return !this.userProfile.isValid; }

  public login$(userId: string): Observable<boolean> {
    this._userId = userId;
    const isComplete$: Subject<boolean> = new Subject();
    this._getUserAccountProfile$()
      .subscribe({
        next: (profile) => {
          this._userProfile$ = new BehaviorSubject(profile);
          isComplete$.next(true);
        },
        error: e => console.log("Error", e),
        complete: () => isComplete$.complete()
      });
    return isComplete$.asObservable();
  }


  /**
   * 
   */
  public saveChanges$(): Observable<boolean> {
    // console.log("Saving changes")
    const profile = this.userProfile;
    const _complete$: Subject<boolean> = new Subject();
    const url = serverUrl + "/api/user-account-profile/save";
    const body = {
      id: profile.id,
      userId: this._userId,
      userProfile: profile.userProfileHttp(),
    }
    this.httpClient.post<{ message: string, data: any, success: boolean }>(url, body)
      .subscribe((response) => {
        // console.log("Respoinse is: ", response)
        if (response.success === true) {
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


  public saveAppPreferencesChanges$(preferences: UAPAppPreferences): Observable<boolean> {
    const profile = this.userProfile;
    profile.setAppPreferences(preferences);
    const _complete$: Subject<boolean> = new Subject();
    const url = serverUrl + "/api/user-account-profile/save";
    const body = {
      id: this.userProfile.id,
      userId: this._userId,
      userProfile: profile.userProfileHttp(),
    }
    this.httpClient.post<{ message: string, data: any, success: boolean }>(url, body)
      .subscribe((response) => {
        // console.log("Respoinse is: ", response)
        if (response.success === true) {
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
  public saveAppConfigChanges$(config: UAPAppConfiguration): Observable<boolean> {
    const profile = this.userProfile;
    profile.setAppConfig(config);
    const _complete$: Subject<boolean> = new Subject();
    const url = serverUrl + "/api/user-account-profile/save";
    const body = {
      id: this.userProfile.id,
      userId: this._userId,
      userProfile: profile.userProfileHttp(),
    }
    this.httpClient.post<{ message: string, data: any, success: boolean }>(url, body)
      .subscribe((response) => {
        // console.log("Respoinse is: ", response)
        if (response.success === true) {
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
        // console.log("Building : ", response)
        if (response.success === true) {
          return new UserAccountProfile(response.data);
        } else {
          return new UserAccountProfile(null);
        }
      }));
  }

  public logout() {
    this._userId = '';
    this._userProfile$ = null;
  }
}
