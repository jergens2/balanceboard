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
import * as moment from 'moment';


@Injectable()
export class AuthenticationService {

  // private _authStatusSubject$: BehaviorSubject<AuthStatus> = new BehaviorSubject<AuthStatus>(null);
  private _loginAttempt$: Subject<boolean> = new Subject();
  private _logout$: Subject<boolean> = new Subject();
  private _appComponentLogin$: Subject<boolean> = new Subject();

  constructor(
    private http: HttpClient,
    private serviceAuthenticationService: ServiceAuthenticationService,
  ) { }

  // public get authStatus$(): Observable<AuthStatus> { return this._authStatusSubject$.asObservable(); }

  private _isAuthenticated: boolean = false;
  private _authStatus: AuthStatus;

  public get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
  public get token(): string {
    if(this._authStatus){
      return this._authStatus.token;
    }
    return "";
  }
  public get user(): UserAccount {
    if(this._authStatus){
      return this._authStatus.user;
    }
    return null;
  }
  public get userId(): string {
    if(this._authStatus){
      return this._authStatus.user.id;
    }
    return "";
  }
  public get userEmail(): string {
    if(this._authStatus){
      return this._authStatus.user.email;
    }
    return "";

  }
  public get userSocialId(): string {
    return "warning: social id disabled.";
  }
  public get loginAttempt$(): Observable<boolean> {
    return this._loginAttempt$.asObservable();
  }

  public registerNewUserAccount$(authData: AuthData): Observable<Object> {
    return this.http.post(serverUrl + "/api/authentication/register", authData)
  }
  public get logout$(): Observable<boolean> {
    return this._logout$.asObservable();
  }
  public get appComponentLogin$(): Observable<boolean> {
    return this._appComponentLogin$.asObservable();
  }

  public attemptLogin(authData: AuthData) {
    console.log("Login attempt:", authData);
    this.http.post<{ message: string, data: any }>(serverUrl + "/api/authentication/authenticate", authData)

      .pipe<AuthStatus>(map((response) => {
        console.log("Login attempt response: ", response)
        console.log("Expires in: " , response.data.expiresIn)
        const token: string = response.data.token;
        const userId: string = response.data.userAccount.id;
        const username: string = response.data.userAccount.username;
        const email: string = response.data.userAccount.email;
        const expiresAt = moment().add(response.data.expiresIn, 'seconds');
        console.log("Login attempt:  expiration is "  + expiresAt.format('YYYY-MM-DD hh:mm a'))
        const userAccount = new UserAccount(userId, username, email);
        let responseAuthStatus = new AuthStatus(token, userAccount, moment(expiresAt));
        return responseAuthStatus;
      }))
      .subscribe((authStatus: AuthStatus) => {
        this._loginAttempt$.next(true);
        this._loginRoutine(authStatus);

      }, (error) => {
        console.log("Login attempt failed: ", error);
        this._loginAttempt$.next(false);
      })
  }

  public getUserById$(userId: string): Observable<UserAccount> {
    return this.http.get<{ message: string, data: any }>(serverUrl + "/api/authentication/getUserById/" + userId)
      .pipe(map((response) => {
        let settings: any[] = Object.assign([], response.data.userSettings);
        let userSettings: UserSetting[] = [];
        for (let setting of settings) {
          let userSetting: UserSetting = new UserSetting(setting.name, setting.booleanValue, setting.numericValue, setting.stringValue);
          userSettings.push(userSetting);
        }
        return new UserAccount(response.data.id, response.data.username, response.data.email);
      }))
  }

  public checkForExistingAccount$(email: string): Observable<Object> {
    return this.http.get(serverUrl + "/api/authentication/validateNewEmail/" + email)
  }

  /**
   * This variable is required for the purposes of telling the AppComponent when to be loading or not.
   * 
   * in the AppComponent:
   * Start with loading=true, then  check local storage.
   * if local storage --> try to log in with it (and continue loading in the app component)
   * but if no local storage, stop loading 
   */
  public checkLocalStorage$: Subject<boolean> = new Subject();

  public checkLocalStorage() {
    console.log("Checking local storage");
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const expirationString = localStorage.getItem('expiration');
    if (!token || !user || !expirationString) {
      localStorage.clear();
      this._authStatus = null;
      this.checkLocalStorage$.next(false);
    } else {
      const milliseconds = Number(expirationString);
      const expiration: moment.Moment = moment(milliseconds);
      if(moment().isAfter(expiration)){
        localStorage.clear();
        this._authStatus = null;
        this.checkLocalStorage$.next(false);
      }else{
        const parse = JSON.parse(localStorage.getItem("user"));
        let user: UserAccount = new UserAccount(parse.id, parse.username, parse.email);
        this._loginRoutine(new AuthStatus(localStorage.getItem("token"), user, expiration));
        this.checkLocalStorage$.next(true);
      }
      
    }
  }


  // public updateUserSettings(user: UserAccount) {
  //   localStorage.removeItem("user");
  //   localStorage.setItem("user", JSON.stringify(user));
  //   this._authStatusSubject$.next(new AuthStatus(localStorage.getItem("token"), user, true));
  // }


  public logout() {
    localStorage.clear();
    this._isAuthenticated = false;
    this.serviceAuthenticationService.logout();

    this._authStatus = null;
    
    this._appComponentLogin$.next(false);
    // this._authStatusSubject$ = new BehaviorSubject(new AuthStatus(null, null, false));
    // this._authStatusSubject$.next(null);
    this._logout$.next();
  }




  private _loginRoutine(authStatus: AuthStatus) {
    console.log("loginRoutine: " , authStatus)
    console.log("expires at: " + authStatus.expiresAt.format('YYYY-MM-DD hh:mm:ss a'))
    /*
      This is where we can execute things that need to be loaded for the user before displaying the app.
      This mostly includes async tasks like fetching data from the server.

      Delegated to service-authentication-service.ts
    */

    if (authStatus.isValid()) {
      this._authStatus = authStatus;
      this.serviceAuthenticationService.loginServices$(authStatus).subscribe((serviceLoginsComplete: boolean) => {
        if (serviceLoginsComplete === true) {
          this._completeLogin(authStatus);
        }
      });
    } else {
      localStorage.clear();
      this._authStatus = null;
      this._appComponentLogin$.next(false);
    }

  }

  private _completeLogin(authStatus: AuthStatus) {
    console.log("Complete")
    localStorage.clear();
    if (authStatus.isValid) {
      localStorage.setItem("token", authStatus.token);
      localStorage.setItem("user", JSON.stringify(authStatus.user));
      localStorage.setItem("expiration", authStatus.expiresAt.valueOf().toString());

      const expiresAt = moment(authStatus.expiresAt);
      const now = moment();
      const dueTime = expiresAt.diff(now, 'milliseconds');
      console.log("In " + dueTime + " milliseconds") 
      timer(dueTime).subscribe((tokenHasExpired)=>{
        console.log("WARNING: THE TOKEN IS EXPIRED.")
        this._isAuthenticated = false;
      })

      this._isAuthenticated = true;
      this._authStatus = authStatus;
      this._appComponentLogin$.next(true);
    } else {
      this._isAuthenticated = false;
      this._authStatus = null;
      this._appComponentLogin$.next(false);
    }

  }

}
