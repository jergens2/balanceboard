import { map } from 'rxjs/operators';
import { UserAccount } from '../shared/document-definitions/user-account/user-account.class';
import { Observable, Subject, BehaviorSubject, Subscription, timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.interface';
import { AuthStatus } from './auth-status.class';
import { serverUrl } from '../serverurl';
import { UserSetting } from '../shared/document-definitions/user-account/user-settings/user-setting.model';
import { ServiceAuthenticationService } from './service-authentication/service-authentication.service';


@Injectable()
export class AuthenticationService {

  private _authStatusSubject$: BehaviorSubject<AuthStatus> = new BehaviorSubject<AuthStatus>(null);

  get authStatus$(): Observable<AuthStatus> {
    return this._authStatusSubject$.asObservable();
  }


  constructor(
    private http: HttpClient,
    private serviceAuthenticationService: ServiceAuthenticationService,
  ) { }

  private serverUrl = serverUrl;

  public get token(): string {
    if(this._authStatusSubject$.getValue()){
      return this._authStatusSubject$.getValue().token;
    }else{
      return "";
    }
  }
  public get user(): UserAccount{
    if(this._authStatusSubject$.getValue()){
      return this._authStatusSubject$.getValue().user;
    }else{
      return null;
    }
  }
  public get userId(): string{
    if(this._authStatusSubject$.getValue()){
      return this._authStatusSubject$.getValue().user.id;
    }else{
      return "";
    }
  } 
  public get userEmail(): string{
    if(this._authStatusSubject$.getValue()){
      return this._authStatusSubject$.getValue().user.email;
    }else{
      return "";
    }
  }
  public get userSocialId(): string{
    if(this._authStatusSubject$.getValue()){
      return this._authStatusSubject$.getValue().user.socialId;
    }else{
      return "";
    }
  }


  registerNewUserAccount$(authData: AuthData): Observable<Object> {
    return this.http.post(this.serverUrl + "/api/authentication/register", authData)
  }

  private _loginAttempt$: Subject<boolean> = new Subject();
  public get loginAttempt$(): Observable<boolean> { 
    return this._loginAttempt$.asObservable();
  } 

  loginAttempt(authData: AuthData) {
    // console.log("Login attempt:", authData);
    this.http.post<{ message: string, data: any }>(this.serverUrl + "/api/authentication/authenticate", authData)
      .pipe<AuthStatus>(map((response) => {
        let settings: any[] = Object.assign([], response.data.userAccount.userSettings);
        let userSettings: UserSetting[] = [];
        for (let setting of settings) {
          let userSetting: UserSetting = new UserSetting(setting.name, setting.booleanValue, setting.numericValue, setting.stringValue);
          userSettings.push(userSetting);
        }
        let responseAuthStatus = new AuthStatus(response.data.token, new UserAccount(response.data.userAccount._id, response.data.userAccount.email, response.data.userAccount.socialId, userSettings), true);
        return responseAuthStatus;
      }))
      .subscribe((authStatus: AuthStatus) => {
        this._loginAttempt$.next(true);
        this.loginRoutine(authStatus);

      }, (error) => {
        console.log("Login attempt failed: ", error);
        this._loginAttempt$.next(false);
      })
  }

  private loginRoutine(authStatus: AuthStatus) {
    /*
      This is where we can execute things that need to be loaded for the user before displaying the app.
      This mostly includes async tasks like fetching data from the server.

      Delegated to service-authentication-service.ts
    */

    if (authStatus.isAuthenticated) {
      this.serviceAuthenticationService.loginServices$(authStatus).subscribe((serviceLoginsComplete: boolean)=>{
        if(serviceLoginsComplete === true){
          this.completeLogin(authStatus);
        }
      });
    }else{
      this.completeLogin(authStatus);
    }

  }

  completeLogin(authStatus: AuthStatus) {
    // console.log("completeLogin(): ", authStatus.user.email);
    if (authStatus.isAuthenticated) {
      localStorage.setItem("token", authStatus.token);
      localStorage.setItem("user", JSON.stringify(authStatus.user));
      this._authStatusSubject$.next(authStatus);
      this._appComponentLogin$.next(true);
    } else {
      this._authStatusSubject$.next(null);
    }

  }

  getUserById$(userId: string): Observable<UserAccount> {
    return this.http.get<{ message: string, data: any }>(this.serverUrl + "/api/authentication/getUserById/" + userId)
      .pipe(map((response) => {
        let settings: any[] = Object.assign([], response.data.userSettings);
        let userSettings: UserSetting[] = [];
        for (let setting of settings) {
          let userSetting: UserSetting = new UserSetting(setting.name, setting.booleanValue, setting.numericValue, setting.stringValue);
          userSettings.push(userSetting);
        }
        return new UserAccount(response.data._id, response.data.email, response.data.socialId, userSettings);
      }))
  }

  checkForExistingAccount$(email: string): Observable<Object> {
    return this.http.get(this.serverUrl + "/api/authentication/validateNewEmail/" + email)
  }

  checkLocalStorage$: Subject<boolean> = new Subject();

  checkLocalStorage() {
    if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
      this._authStatusSubject$.next(null);
      this.checkLocalStorage$.next(false);
    } else {
      let user: UserAccount = JSON.parse(localStorage.getItem("user"));
      this.loginRoutine(new AuthStatus(localStorage.getItem("token"), user, true));
      this.checkLocalStorage$.next(true);
    }
  }


  updateUserSettings(user: UserAccount) {
    localStorage.removeItem("user");
    localStorage.setItem("user", JSON.stringify(user));
    this._authStatusSubject$.next(new AuthStatus(localStorage.getItem("token"), user, true));
  }


  logout() {
    console.log("logging out of auth service");
    localStorage.clear();
    this.serviceAuthenticationService.logout();

    this._authStatusSubject$.next(null);
    // this._authStatusSubject$ = new BehaviorSubject(new AuthStatus(null, null, false));
    // this._authStatusSubject$.next(null);
    this._logout$.next();
  }

  private _logout$: Subject<boolean> = new Subject();
  public get logout$(): Observable<boolean>{
    return this._logout$.asObservable();
  }

  private _appComponentLogin$: Subject<boolean> = new Subject();
  public get appComponentLogin$(): Observable<boolean>{
    return this._appComponentLogin$.asObservable();
  }


}
