import { map } from 'rxjs/operators';
import { User } from './user.model';
import { Observable, Subject, BehaviorSubject, Subscription, timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { AuthStatus } from './auth-status.model';
import { serverUrl } from '../serverurl';
import { UserSetting } from '../user-settings/user-setting.model';
import { ActivitiesService } from '../dashboard/activities/activities.service';
import { TimelogService } from '../dashboard/daybook/time-log/timelog.service';
import { ActivityTree } from '../dashboard/activities/activity-tree.model';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { DayTemplatesService } from '../dashboard/scheduling/day-templates/day-templates.service';
import { DaybookService } from '../dashboard/daybook/daybook.service';
import { TaskService } from '../dashboard/tasks/task.service';
import { Day } from '../dashboard/daybook/day.model';
import { NotebookEntry } from '../dashboard/notebooks/notebook-entry/notebook-entry.model';
import { NotebooksService } from '../dashboard/notebooks/notebooks.service';
import { RecurringTasksService } from '../dashboard/scheduling/recurring-tasks/recurring-tasks.service';


@Injectable()
export class AuthenticationService {

  private _authStatusSubject$: BehaviorSubject<AuthStatus> = new BehaviorSubject<AuthStatus>(new AuthStatus(null, null, false));

  get authStatus$(): Observable<AuthStatus> {
    return this._authStatusSubject$.asObservable();
  }

  constructor(
    private http: HttpClient,
    private activitiesService: ActivitiesService,
    private timelogService: TimelogService,
    private userSettingsService: UserSettingsService,
    private dayTemplatesService: DayTemplatesService,
    private daybookService: DaybookService,
    private notebooksService: NotebooksService,
    private taskService: TaskService,
    private recurringTaskService: RecurringTasksService,
  ) { }

  private serverUrl = serverUrl;

  get token(): string {
    return this._authStatusSubject$.getValue().token;
  }



  private activitiesSubscription: Subscription = new Subscription();
  private dayTemplatesSubscription: Subscription = new Subscription();
  private daybookSubscription: Subscription = new Subscription();
  private notebookSubscription: Subscription = new Subscription();
  private taskSubscription: Subscription = new Subscription();
  private recurringTaskSubscription: Subscription = new Subscription();


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
    /*
      This is where we can execute things that need to be loaded for the user before displaying the app.
      This mostly includes async tasks like fetching data from the server.
    */

    if (authStatus.isAuthenticated) {

      this.userSettingsService.userSettings$.subscribe((changedSettings: UserSetting[]) => {
        let currentStatus = this._authStatusSubject$.getValue();
        if (currentStatus.user != null) {
          let authStatus = Object.assign({}, currentStatus);
          authStatus.user.userSettings = changedSettings;
          // console.log("AuthService: updating authStatus after settings have been changed:", authStatus);
          this._authStatusSubject$.next(authStatus);
        }

      })




      let daybookLoginComplete: boolean = false;
      let dayTemplatesLoginComplete: boolean = false;
      let activitiesLoginComplete: boolean = false;
      let notebookLoginComplete: boolean = false;
      let taskLoginComplete: boolean = false;
      let recurringTasksLoginComplete: boolean = false;


      this.userSettingsService.login(authStatus);

      this.taskSubscription = this.taskService.login$(authStatus).subscribe((loginComplete: boolean) => {
        taskLoginComplete = loginComplete;
      });

      this.recurringTaskSubscription = this.recurringTaskService.login$(authStatus).subscribe((loginComplete: boolean) => {
        if (loginComplete != null) {
          recurringTasksLoginComplete = loginComplete;
        }
      })


      this.notebookSubscription = this.notebooksService.login$(authStatus).subscribe((loginComplete: boolean) => {
        if (loginComplete != null) {
          notebookLoginComplete = loginComplete;
        }
      });

      this.daybookSubscription = this.daybookService.login$(authStatus).subscribe((day: Day) => {
        if (day != null) {
          daybookLoginComplete = true;
        }
      });

      this.dayTemplatesSubscription = this.dayTemplatesService.login$(authStatus).subscribe(() => {
        dayTemplatesLoginComplete = true;
      });

      this.activitiesSubscription = this.activitiesService.login$(authStatus).subscribe((activityTree: ActivityTree) => {
        if (activityTree != null) {
          this.timelogService.login(authStatus)
          activitiesLoginComplete = true;

        } else {
          // console.log("activityTree was null");
        }
      });

      let allComplete: boolean = daybookLoginComplete && dayTemplatesLoginComplete && activitiesLoginComplete && notebookLoginComplete && taskLoginComplete && recurringTasksLoginComplete;
      let timerSubscription: Subscription = new Subscription();



      timerSubscription = timer(200, 200).subscribe(() => {
        allComplete = daybookLoginComplete && dayTemplatesLoginComplete && activitiesLoginComplete && notebookLoginComplete && taskLoginComplete && recurringTasksLoginComplete;
        if (allComplete) {

          this.completeLogin(authStatus);
          timerSubscription.unsubscribe();
        }
      })



    } else {
      console.log("Cannot execute login routine because the authStatus.isAuthenticated == false");
      this.completeLogin(authStatus);
    }

  }

  completeLogin(authStatus: AuthStatus) {
    // console.log("completeLogin(): ", authStatus.user.email);
    if (authStatus.isAuthenticated) {


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

    this.activitiesSubscription.unsubscribe();
    this.dayTemplatesSubscription.unsubscribe();
    this.daybookSubscription.unsubscribe();
    this.notebookSubscription.unsubscribe();
    this.taskSubscription.unsubscribe();
    this.recurringTaskSubscription.unsubscribe();

    this.timelogService.logout();
    this.activitiesService.logout();
    this.userSettingsService.logout();
    this.dayTemplatesService.logout();
    this.daybookService.logout();
    this.taskService.logout();
    this.notebooksService.logout();
    this.recurringTaskService.logout();

    this._authStatusSubject$.next(new AuthStatus(null, null, false));
    // this._authStatusSubject$ = new BehaviorSubject(new AuthStatus(null, null, false));
    // this._authStatusSubject$.next(null);
  }

}
