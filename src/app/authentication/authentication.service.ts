import { map, merge } from 'rxjs/operators';
import { User } from './user.model';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { AuthStatus } from './auth-status.model';
import { serverUrl } from '../serverurl';
import { UserSetting } from '../user-settings/user-setting.model';
import { ActivitiesService } from '../dashboard/activities/activities.service';
import { TimelogService } from '../dashboard/timelog/timelog.service';
import { ActivityTree } from '../dashboard/activities/activity-tree.model';
import { TimeSegment } from '../dashboard/timelog/time-segment.model';
import { UserSettingsService } from '../user-settings/user-settings.service';

@Injectable()
export class AuthenticationService {

  private _authStatusSubject$: BehaviorSubject<AuthStatus> = new BehaviorSubject<AuthStatus>(new AuthStatus(null, null, false));

  get authStatus$(): Observable<AuthStatus> {
    return this._authStatusSubject$.asObservable();
  }

  constructor(private http: HttpClient, private activitiesService: ActivitiesService, private timelogService: TimelogService, private userSettingsService: UserSettingsService) {
    // console.log("Authentication service constructor has been called");
  }

  private serverUrl = serverUrl;

  get token(): string {
    return this._authStatusSubject$.getValue().token;
  }


  timeSegmentsSubscription: Subscription = new Subscription();
  activitiesSubscription: Subscription = new Subscription();
  

  registerUser$(authData: AuthData): Observable<Object> {
    return this.http.post(this.serverUrl + "/api/authentication/register", authData)
  }

  loginAttempt$: Subject<boolean> = new Subject();

  loginAttempt(authData: AuthData) {
    this.http.post<{ message: string, data: any }>(this.serverUrl + "/api/authentication/authenticate", authData)
      .pipe<AuthStatus>(map((response) => {
        let settings: any[] = Object.assign([], response.data.user.userSettings);
        let userSettings: UserSetting[] = [];
        for (let setting of settings) {
          let userSetting: UserSetting = new UserSetting(setting.name, setting.booleanValue, setting.numericValue, setting.stringValue);
          userSettings.push(userSetting);
        }
        let responseAuthStatus = new AuthStatus(response.data.token, new User(response.data.user._id, response.data.user.email, userSettings), true);
        return responseAuthStatus;
      }))
      .subscribe((authStatus: AuthStatus) => {
        this.loginAttempt$.next(true);
        this.loginRoutine(authStatus);
        
      }, (error) => {
        this.loginAttempt$.next(false);
      })
  }

  private loginRoutine(authStatus: AuthStatus) {
    // console.log("loginRoutine(): ", authStatus.user.email)
    /*
      This is where we can execute things that need to be loaded for the user before displaying the app.
      This mostly includes async tasks like fetching data from the server.

      Currently, activities service must execute first and retreive the activity tree, because this activity tree must exist, before the
      timeSegments can define their .activities[] property
    */

    if (authStatus.isAuthenticated) {

      this.userSettingsService.userSettings$.subscribe((changedSettings: UserSetting[])=>{
        let currentStatus = this._authStatusSubject$.getValue();
        if(currentStatus.user != null){
          let authStatus = Object.assign({}, currentStatus);
          authStatus.user.userSettings = changedSettings;
          // console.log("AuthService: updating authStatus after settings have been changed:", authStatus);
          this._authStatusSubject$.next(authStatus);
        }
        
      })
      this.userSettingsService.login(authStatus);

      this.activitiesSubscription = this.activitiesService.login$(authStatus).subscribe((activityTree: ActivityTree) => {
        if (activityTree != null) {
          this.timeSegmentsSubscription = this.timelogService.login$(authStatus).subscribe((timeSegments: TimeSegment[]) => {
            if (timeSegments != null) {
              // console.log("activities and timesegments have loaded.", activityTree, timeSegments);
              this.completeLogin(authStatus);

            } else {
              // console.log("timesegments was null");
            }
          });


        } else {
          // console.log("activityTree was null");
        }
      });




    }else{
      console.log("Cannot execute login routine because the authStatus.isAuthenticated == false");
      this.completeLogin(authStatus);
    }

  }

  completeLogin(authStatus: AuthStatus) { 
    // console.log("completeLogin(): ", authStatus.user.email);
    if (authStatus.isAuthenticated) {

      localStorage.clear();
      localStorage.setItem("token", authStatus.token);
      localStorage.setItem("user", JSON.stringify(authStatus.user));
      // console.log("completing login, authStatus", authStatus.user.email)
      this._authStatusSubject$.next(authStatus);
    } else {
      // console.log("not authenticated, nexting a bad authstatus");
      this._authStatusSubject$.next(new AuthStatus(null, null, false));
    }

  }

  getUserById$(userId: string): Observable<User> {
    return this.http.get<{ message: string, data: any }>(this.serverUrl + "/api/authentication/getUserById/" + userId)
      .pipe(map((response) => {
        let settings: any[] = Object.assign([], response.data.userSettings);
        let userSettings: UserSetting[] = [];
        for (let setting of settings) {
          let userSetting: UserSetting = new UserSetting(setting.name, setting.booleanValue, setting.numericValue, setting.stringValue);
          userSettings.push(userSetting);
        }
        return new User(response.data._id, response.data.email, userSettings);
      }))
  }

  checkForExistingAccount$(email: string): Observable<Object> {
    return this.http.get(this.serverUrl + "/api/authentication/validateNewEmail/" + email)
  }

  checkLocalStorage$: Subject<boolean> = new Subject();

  checkLocalStorage() {
    if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
      // console.log("no local storage, so nexting a bad auth status" )
      this._authStatusSubject$.next(new AuthStatus(null, null, false));
      this.checkLocalStorage$.next(false);
    } else {
      let user: User = JSON.parse(localStorage.getItem("user"));
      // console.log("userEmail from localStorage:" , user.email)
      this.loginRoutine(new AuthStatus(localStorage.getItem("token"), user, true));
      this.checkLocalStorage$.next(true);
    }
  }


  updateUserSettings(user: User) {
    localStorage.removeItem("user");
    localStorage.setItem("user", JSON.stringify(user));
    this._authStatusSubject$.next(new AuthStatus(localStorage.getItem("token"), user, true));
  }


  logout() {
    // console.log("logging out of auth service");
    localStorage.clear();
    this.timeSegmentsSubscription.unsubscribe();
    this.activitiesSubscription.unsubscribe();

    this.timelogService.logout();
    this.activitiesService.logout();

    this._authStatusSubject$.next(new AuthStatus(null, null, false));
    // this._authStatusSubject$ = new BehaviorSubject(new AuthStatus(null, null, false));
    // this._authStatusSubject$.next(null);
  }

}
