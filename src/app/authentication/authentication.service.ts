import { map } from 'rxjs/operators';
import { Observable, Subject, BehaviorSubject, Subscription, timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegistrationData } from './auth-data.interface';
import { AuthStatus } from './auth-status.class';
import { serverUrl } from '../serverurl';
import { UserSetting } from '../shared/document-definitions/user-account/user-settings/user-setting.model';
import * as moment from 'moment';
import { RegistrationController } from './registration-controller.class';


@Injectable()
export class AuthenticationService {

  // private _authStatusSubject$: BehaviorSubject<AuthStatus> = new BehaviorSubject<AuthStatus>(null);
  private _loginAttempt$: Subject<boolean> = new Subject();
  private _logout$: Subject<boolean> = new Subject();
  private _appComponentLogin$: Subject<boolean> = new Subject();
  private _unlockAttempts: number = 0;

  // used by AuthenticationComponent to subscribe to changes
  private _lockApp$: Subject<boolean> = new Subject();

  constructor(
    private http: HttpClient,
  ) { }

  // public get authStatus$(): Observable<AuthStatus> { return this._authStatusSubject$.asObservable(); }

  private _isAuthenticated: boolean = false;
  private _authStatus: AuthStatus;

  private _timerSubs: Subscription[] = [];

  public get isAuthenticated(): boolean { return this._isAuthenticated; }

  public get token(): string { return this._authStatus ? this._authStatus.token : ''; }
  public get userId(): string { return this._authStatus ? this._authStatus.userId : ''; }
  public get userEmail(): string { return this._authStatus ? this._authStatus.email : ''; }
  public get username(): string { return this._authStatus ? this._authStatus.username : ''; }

  public get loginAttempt$(): Observable<boolean> { return this._loginAttempt$.asObservable(); }
  public get lockApp$(): Observable<boolean> { return this._lockApp$.asObservable(); }

  public get logout$(): Observable<boolean> { return this._logout$.asObservable(); }
  public get appComponentLogin$(): Observable<boolean> { return this._appComponentLogin$.asObservable(); }
  public get hasUsername(): boolean {
    if (this.username) {
      const nullMatch = /NULL_([a-zA-Z0-9-]{36})/;
      if (!nullMatch.test(this.username)) {
        return true;
      }
    }
    return false;
  }


  public attemptLogin(authData: RegistrationData) {
    // console.log("Login attempt:", authData);
    this.http.post<{ message: string, data: any }>(serverUrl + "/api/authentication/authenticate", authData)

      .pipe<AuthStatus>(map((response: {
        message: string,
        success: boolean,
        data: {
          id: string,
          username: string,
          email: string,
          token: string,
          expiresIn: number,
        }
      }) => {
        // console.log("Login attempt response: ", response)
        // console.log("Expires in: ", response.data.expiresIn)
        const token: string = response.data.token;
        const userId: string = response.data.id;
        const username: string = response.data.username;
        const email: string = response.data.email;
        const expiresAt = moment().add(response.data.expiresIn, 'seconds');
        // console.log("Login attempt:  expiration is " + expiresAt.format('YYYY-MM-DD hh:mm a'))
        let responseAuthStatus = new AuthStatus(token, userId, username, email, moment(expiresAt));
        return responseAuthStatus;
      }))
      .subscribe((authStatus: AuthStatus) => {
        // console.log("Subscribe: ", authStatus)
        this._loginAttempt$.next(true);
        this._loginRoutine(authStatus, 'STANDARD');

      }, (error) => {
        // console.log("Login attempt failed: ", error);
        this._loginAttempt$.next(false);
      });
  }

  public loginFromRegistration() {
    const authData = this._registrationContoller.getAuthData();
    this.attemptLogin(authData);
  }

  public refreshToken$(token: string, userId: string): Observable<boolean> {
    const _result$: Subject<boolean> = new Subject();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      })
    };
    const data = {
      token: token,
      userId: userId
    }

    this.http.post<{ message: string, data: any }>(serverUrl + "/api/authentication/refresh-token", data, httpOptions).subscribe((response: {
      message: string,
      success: boolean,
      data: {
        id: string,
        username: string,
        email: string,
        token: string,
        expiresIn: number,
      }
    }) => {
      const token: string = response.data.token;
      const userId: string = response.data.id;
      const username: string = response.data.username;
      const email: string = response.data.email;
      const expiresAt = moment().add(response.data.expiresIn, 'seconds');
      let responseAuthStatus = new AuthStatus(token, userId, username, email, moment(expiresAt));
      this._loginRoutine(responseAuthStatus, 'REFRESH_TOKEN');
      _result$.next(true);
    }, (error) => {
      console.log("Token refresh error: ", error);
      _result$.next(false);
    });

    return _result$.asObservable();
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

  public unlockWithPin(pin: string, email: string) {
    const data = {
      email: email,
      pin: pin,
    }
    this.http.post<any>(serverUrl + "/api/authentication/pin-unlock", data)
      .pipe<AuthStatus>(map((response: {
        message: string,
        success: boolean,
        data: {
          id: string,
          username: string,
          email: string,
          token: string,
          expiresIn: number,
        }
      }) => {
        // console.log("Login attempt response: ", response)
        // console.log("Expires in: ", response.data.expiresIn)
        const token: string = response.data.token;
        const userId: string = response.data.id;
        const username: string = response.data.username;
        const email: string = response.data.email;
        const expiresAt = moment().add(response.data.expiresIn, 'seconds');
        // console.log("Login attempt:  expiration is " + expiresAt.format('YYYY-MM-DD hh:mm a'))
        let responseAuthStatus = new AuthStatus(token, userId, username, email, moment(expiresAt));
        return responseAuthStatus;
      }))
      .subscribe((authStatus: AuthStatus) => {
        // console.log("pin unlock ")
        this._loginAttempt$.next(true);
        this._loginRoutine(authStatus, 'PIN');

      }, (error) => {
        // console.log("Login attempt failed: ", error);
        if(this._unlockAttempts >= 3){
          this.logout();
        }else{
          this._unlockAttempts++;
          this._loginAttempt$.next(false);
        }
        
      });
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


  /**
   * Both lock() and logout() are methods that stop the app, via _appComponentLogin$.next(false), causing AppComponent to unload the app.
   * The difference between lock() and logout() is:
   * lock allows for an unlock via PIN for a pre-determined period of time (e.g. 1 hour window), while logout() clears everything instantly.
   * lock(), therefore, is simply for the convenience of the user to not have to sign out of their app every time they leave their PC, 
   * rather than leave the app completely open.  an optional function.
   */
  public lock() {
    console.log("locking")
    this._isAuthenticated = false;
    this._appComponentLogin$.next(false);
    this._timerSubs.forEach(s => s.unsubscribe());
    this._timerSubs = [];
    this._authStatus = null;
    localStorage.setItem("token", "LOCKED_TOKEN")
    this._unlockAttempts = 0;
    this._lockApp$.next(true);
  }

  public logout() {
    localStorage.clear();
    this._isAuthenticated = false;
    this._timerSubs.forEach(s => s.unsubscribe());
    this._timerSubs = [];
    this._authStatus = null;

    // console.log(" ** _appComponentLogin$.next(false) - reason:  Logout()");
    this._appComponentLogin$.next(false);
    // this._authStatusSubject$ = new BehaviorSubject(new AuthStatus(null, null, false));
    // this._authStatusSubject$.next(null);
    this._loginAttempt$.next(false);
    this._registrationContoller = null;
    this._logout$.next();
    this._unlockAttempts = 0;
  }




  private _loginRoutine(authStatus: AuthStatus, action: 'PIN' | 'STANDARD' | 'REFRESH_TOKEN') {
    if (authStatus.isAuthenticated()) {
      // console.log("Auth status IS authenticated.")
      this._authStatus = authStatus;
      localStorage.clear();
      localStorage.setItem("token", authStatus.token);
      localStorage.setItem("userId", authStatus.userId);
      localStorage.setItem("username", authStatus.username);
      localStorage.setItem("email", authStatus.email);
      localStorage.setItem("expiration", authStatus.expiresAt.valueOf().toString());



      const expiresAt = moment(authStatus.expiresAt);
      const now = moment();
      const dueTime = (expiresAt.diff(now, 'milliseconds'));
      const requestNew = (expiresAt.diff(now, 'milliseconds') - (60 * 1000));
      this._timerSubs.forEach(s => s.unsubscribe());
      const tokenExpiredSub = timer(dueTime).subscribe((tokenHasExpired) => {
        console.log("WARNING: THE TOKEN IS EXPIRED.")
        this._isAuthenticated = false;
        // console.log(" ** _appComponentLogin$.next(false)");
        this._appComponentLogin$.next(false);
      });
      const refreshSub = timer(requestNew).subscribe((requestNew) => {
        this.refreshToken$(authStatus.token, authStatus.userId);
      });
      this._timerSubs = [ tokenExpiredSub, refreshSub ];


      this._isAuthenticated = true;
      this._authStatus = authStatus;

      // console.log(" ** _appComponentLogin$.next(true) - Standard login");
      this._appComponentLogin$.next(true);
    } else {
      // console.log("Auth status is NOT AUTHENTICATED")
      localStorage.clear();
      this._isAuthenticated = false;
      this._authStatus = null;
      // console.log(" ** _appComponentLogin$.next(false) - bad auth?");
      this._appComponentLogin$.next(false);
    }


  }




}
