import { map } from 'rxjs/operators';
import { Observable, Subject, BehaviorSubject, Subscription, timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegistrationData } from './auth-data.interface';
import { AuthStatus } from './auth-status.class';
import { serverUrl } from '../serverurl';
import { UserSetting } from '../shared/document-definitions/user-account/user-settings/user-setting.model';
import { ServiceAuthenticationService } from './service-authentication/service-authentication.service';
import * as moment from 'moment';
import { ServiceAuthenticationAttempt } from './service-authentication/service-authentication-attempt.interface';
import { RegistrationController } from './registration-controller.class';


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

  public get isAuthenticated(): boolean { return this._isAuthenticated; }

  public get token(): string { return this._authStatus ? this._authStatus.token : ''; }
  public get userId(): string { return this._authStatus ? this._authStatus.userId : ''; }
  public get userEmail(): string { return this._authStatus ? this._authStatus.email : ''; }
  public get username(): string { return this._authStatus ? this._authStatus.username : ''; }

  public get loginAttempt$(): Observable<boolean> { return this._loginAttempt$.asObservable(); }

  public get logout$(): Observable<boolean> { return this._logout$.asObservable(); }
  public get appComponentLogin$(): Observable<boolean> { return this._appComponentLogin$.asObservable(); }


  public attemptLogin(authData: RegistrationData) {
    console.log("Login attempt:", authData);
    this.http.post<{ message: string, data: any }>(serverUrl + "/api/authentication/authenticate", authData)

      .pipe<AuthStatus>(map((response) => {
        console.log("Login attempt response: ", response)
        console.log("Expires in: ", response.data.expiresIn)
        const token: string = response.data.token;
        const userId: string = response.data.userAccount.id;
        const username: string = response.data.userAccount.username;
        const email: string = response.data.userAccount.email;
        const expiresAt = moment().add(response.data.expiresIn, 'seconds');
        console.log("Login attempt:  expiration is " + expiresAt.format('YYYY-MM-DD hh:mm a'))
        let responseAuthStatus = new AuthStatus(token, userId, username, email, moment(expiresAt));
        return responseAuthStatus;
      }))
      .subscribe((authStatus: AuthStatus) => {
        this._loginAttempt$.next(true);
        this._loginRoutine(authStatus);

      }, (error) => {
        console.log("Login attempt failed: ", error);
        this._loginAttempt$.next(false);
      });
  }

  public loginFromRegistration() {
    const authData = this._registrationContoller.getAuthData();
    this.attemptLogin(authData);
  }

  public refreshToken$(token: string): Observable<any> {
    return this.http.post<{ message: string, data: any }>(serverUrl + "/api/authentication/refresh-token", token);
  }

  public getUserById$(userId: string): Observable<string> {
    return this.http.get<any>(serverUrl + "/api/authentication/getUserById/" + userId)
      .pipe(map((response) => {
        let settings: any[] = Object.assign([], response.data.userSettings);
        let userSettings: UserSetting[] = [];
        for (let setting of settings) {
          let userSetting: UserSetting = new UserSetting(setting.name, setting.booleanValue, setting.numericValue, setting.stringValue);
          userSettings.push(userSetting);
        }
        return response.data.username;
      }))
  }

  public checkForExistingAccount$(email: string, username: string): Observable<Object> {
    return this.http.get(serverUrl + "/api/authentication/check-for-existing/" + email + "/" + username);
  }

  public unlockWithPin$(pin: string): Observable<boolean> {
    console.log("Warning: method not implemented.")
    return null;
  }
  public finalizeRegistration$(data: { email: string, code: string }): Observable<any> {
    return this.http.post<any>(serverUrl + "/api/authentication/finalize-registration", data);
  }
  public resendRegistrationCode$(): Observable<any> {
    if (this._registrationContoller) {
      const authData = this.registrationController.getAuthData();
      return this.http.post<any>(serverUrl + "/api/authentication/resend-code", authData);
    } else {
      console.log("Application errror: no registration controller object");
      return null;
    }

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

  public registerNewUserAccount$(authData: RegistrationData): Observable<Object> {
    return this.http.post(serverUrl + "/api/authentication/register", authData)
  }

  private _registrationContoller: RegistrationController;

  public setInitialRegistrationData(authData: RegistrationData) {
    let controller = new RegistrationController(authData);
    this._registrationContoller = controller;
  }
  public get registrationController(): RegistrationController { return this._registrationContoller; }
  public destoryRegController() {
    this._registrationContoller = null;
  }

  public logout() {
    localStorage.clear();
    this._isAuthenticated = false;
    // this.serviceAuthenticationService.logout();

    this._authStatus = null;

    this._appComponentLogin$.next(false);
    // this._authStatusSubject$ = new BehaviorSubject(new AuthStatus(null, null, false));
    // this._authStatusSubject$.next(null);
    this._logout$.next();
  }




  private _loginRoutine(authStatus: AuthStatus) {
    console.log("loginRoutine: ", authStatus)
    console.log("expires at: " + authStatus.expiresAt.format('YYYY-MM-DD hh:mm:ss a'))
    /*0
      This is where we can execute things that need to be loaded for the user before displaying the app.
      This mostly includes async tasks like fetching data from the server.

      Delegated to service-authentication-service.ts
    */

    if (authStatus.isAuthenticated()) {
      this._authStatus = authStatus;
      console.log("We have arrived at an impasse.");
      // this.serviceAuthenticationService.loginServices$(authStatus).subscribe((serviceLoginsComplete: ServiceAuthenticationAttempt) => {
      //   if (serviceLoginsComplete.authenticated === true) {
      //     console.log("Completing login")
      //     this._completeLogin(authStatus);
      //   } else {
      //     console.log("Error attempting to log in to the services.")
      //   }
      // });
      this._completeLogin(authStatus);
    } else {
      localStorage.clear();
      this._authStatus = null;
      this._appComponentLogin$.next(false);
    }

  }



  private _completeLogin(authStatus: AuthStatus) {
    console.log("Complete")
    localStorage.clear();
    if (authStatus.isAuthenticated) {
      localStorage.setItem("token", authStatus.token);
      localStorage.setItem("userId", authStatus.userId);
      localStorage.setItem("username", authStatus.username);
      localStorage.setItem("email", authStatus.email);
      localStorage.setItem("expiration", authStatus.expiresAt.valueOf().toString());

      const expiresAt = moment(authStatus.expiresAt);
      const now = moment();
      const dueTime = (expiresAt.diff(now, 'milliseconds') - (60*1000));
      console.log("In " + dueTime + " milliseconds")
      timer(dueTime).subscribe((tokenHasExpired) => {
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
