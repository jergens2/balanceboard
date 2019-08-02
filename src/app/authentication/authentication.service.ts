import { map } from 'rxjs/operators';
import { UserAccount } from '../shared/document-definitions/user-account/user-account.class';
import { Observable, Subject, BehaviorSubject, Subscription, timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.interface';
import { AuthStatus } from './auth-status.class';
import { serverUrl } from '../serverurl';
import { UserSetting } from '../shared/document-definitions/user-account/user-settings/user-setting.model';
import { ActivityCategoryDefinitionService } from '../shared/document-definitions/activity-category-definition/activity-category-definition.service';
import { TimelogService } from '../shared/document-data/timelog-entry/timelog.service';
import { ActivityTree } from '../shared/document-definitions/activity-category-definition/activity-tree.class';
import { UserSettingsService } from '../shared/document-definitions/user-account/user-settings/user-settings.service';
import { DayTemplatesService } from '../dashboard/scheduling/day-templates/day-templates.service';
import { DayDataService } from '../shared/document-data/day-data/day-data.service';
import { TaskService } from '../dashboard/tasks/task.service';
import { DayData } from '../shared/document-data/day-data/day-data.class';
import { NotebookEntry } from '../dashboard/notebooks/notebook-entry/notebook-entry.model';
import { NotebooksService } from '../dashboard/notebooks/notebooks.service';
import { RecurringTasksService } from '../shared/document-definitions/recurring-task-definition/recurring-tasks.service';
import { TimeViewsService } from '../shared/time-views/time-views.service';
import { DailyTaskListService } from '../shared/document-data/daily-task-list/daily-task-list.service';
import { ServiceAuthentication } from './service-authentication.interface';
import { ActivityDayDataService } from '../shared/document-data/activity-day-data/activity-day-data.service';
import { SocialService } from '../shared/document-definitions/user-account/social.service';


@Injectable()
export class AuthenticationService {

  private _authStatusSubject$: BehaviorSubject<AuthStatus> = new BehaviorSubject<AuthStatus>(new AuthStatus(null, null, false));

  get authStatus$(): Observable<AuthStatus> {
    return this._authStatusSubject$.asObservable();
  }


  constructor(
    private http: HttpClient,
    private activityCategoryDefinitionService: ActivityCategoryDefinitionService,
    private activityDayDataService: ActivityDayDataService,
    private timelogService: TimelogService,
    private userSettingsService: UserSettingsService,
    private dayTemplatesService: DayTemplatesService,
    private dayDataService: DayDataService,
    private notebooksService: NotebooksService,
    private taskService: TaskService,
    private recurringTaskService: RecurringTasksService,
    private timeViewsService: TimeViewsService,
    private dailyTaskListService: DailyTaskListService,
    private socialService: SocialService,
  ) { }

  private serverUrl = serverUrl;

  get token(): string {
    return this._authStatusSubject$.getValue().token;
  }


  private _serviceAuthentications: ServiceAuthentication[] = [
    { name: "activities", subscription: new Subscription, isAuthenticated: false, },
    { name: "timelog", subscription: new Subscription, isAuthenticated: false, },
    { name: "activityDayData", subscription: new Subscription, isAuthenticated: false, },

    { name: "dayTemplates", subscription: new Subscription, isAuthenticated: false, },
    { name: "notebooks", subscription: new Subscription, isAuthenticated: false, },
    { name: "tasks", subscription: new Subscription, isAuthenticated: false, },
    { name: "recurringTaskDefinitions", subscription: new Subscription, isAuthenticated: false, },

    { name: "timeViews", subscription: new Subscription, isAuthenticated: false, },
    { name: "dailyTaskList", subscription: new Subscription, isAuthenticated: false, },
    { name: "social", subscription: new Subscription, isAuthenticated: false, },
  ]

  registerNewUserAccount$(authData: AuthData): Observable<Object> {
    return this.http.post(this.serverUrl + "/api/authentication/register", authData)
  }

  loginAttempt$: Subject<boolean> = new Subject();

  loginAttempt(authData: AuthData) {
    console.log("Login attempt:", authData);
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
        this.loginAttempt$.next(true);
        this.loginRoutine(authStatus);

      }, (error) => {
        console.log("Login attempt failed: ", error);
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

      this.userSettingsService.login(authStatus);

      this._serviceAuthentications.find((sub) => { return sub.name == "social" }).subscription = this.socialService.login$(authStatus).subscribe((loginComplete: boolean) => {
        this._serviceAuthentications.find((sub) => { return sub.name == "social" }).isAuthenticated = loginComplete;
      });

      this._serviceAuthentications.find((sub) => { return sub.name == "tasks" }).subscription = this.taskService.login$(authStatus).subscribe((loginComplete: boolean) => {
        this._serviceAuthentications.find((sub) => { return sub.name == "tasks" }).isAuthenticated = loginComplete;
      });
      this._serviceAuthentications.find((sub) => { return sub.name == "recurringTaskDefinitions" }).subscription = this.recurringTaskService.login$(authStatus).subscribe((loginComplete: boolean) => {
        if (loginComplete) {
          this._serviceAuthentications.find((sub) => { return sub.name == "recurringTaskDefinitions" }).isAuthenticated = loginComplete;
          this._serviceAuthentications.find((sub) => { return sub.name == "dailyTaskList" }).subscription = this.dailyTaskListService.login$(authStatus).subscribe((dtlLoginComplete: boolean) => {
            this._serviceAuthentications.find((sub) => { return sub.name == "dailyTaskList" }).isAuthenticated = dtlLoginComplete;
          });
        }
      });
      this._serviceAuthentications.find((sub) => { return sub.name == "notebooks" }).subscription = this.notebooksService.login$(authStatus).subscribe((loginComplete: boolean) => {
        if (loginComplete != null) {
          this._serviceAuthentications.find((sub) => { return sub.name == "notebooks" }).isAuthenticated = loginComplete;
        }
      });
      this._serviceAuthentications.find((sub) => { return sub.name == "dayTemplates" }).subscription = this.dayTemplatesService.login$(authStatus).subscribe((loginComplete: boolean) => {
        this._serviceAuthentications.find((sub) => { return sub.name == "dayTemplates" }).isAuthenticated = loginComplete;
      });

      this._serviceAuthentications.find((sub) => { return sub.name == "timeViews" }).subscription = this.timeViewsService.login$().subscribe((loginComplete: boolean) => {
        this._serviceAuthentications.find((sub) => { return sub.name == "timeViews" }).isAuthenticated = loginComplete;
      });
      this._serviceAuthentications.find((sub) => { return sub.name == "activities" }).subscription = this.activityCategoryDefinitionService.login$(authStatus).subscribe((activitiesLoginComplete: boolean) => {
        if (activitiesLoginComplete) {
          this._serviceAuthentications.find((sub) => { return sub.name == "activities" }).isAuthenticated = activitiesLoginComplete;
          this._serviceAuthentications.find((sub) => { return sub.name == "timelog" }).subscription = this.timelogService.login$(authStatus).subscribe((timelogLoginComplete: boolean) => {
            this._serviceAuthentications.find((sub) => { return sub.name == "timelog" }).isAuthenticated = timelogLoginComplete;
          });
          this._serviceAuthentications.find((sub) => { return sub.name == "activityDayData" }).subscription = this.activityDayDataService.login$(authStatus).subscribe((activityDayDataLoginComplete: boolean) => {
            this._serviceAuthentications.find((sub) => { return sub.name == "activityDayData" }).isAuthenticated = activityDayDataLoginComplete;
          });
        }
      });



      let allComplete: boolean = true;
      this._serviceAuthentications.forEach((serviceAuth) => {
        if (serviceAuth.isAuthenticated == false) {
          allComplete = false
        }
      });
      let timerSubscription: Subscription = new Subscription();



      timerSubscription = timer(200, 200).subscribe(() => {
        // console.log("Not yet authenticated: ");
        this._serviceAuthentications.forEach((val)=>{
          if(!val.isAuthenticated){
            // console.log("  ", val.name);
          }
        });
        allComplete = true;
        this._serviceAuthentications.forEach((serviceAuth) => {
          if (serviceAuth.isAuthenticated == false) {
            allComplete = false
            // console.log(this._serviceAuthentications)
          }
        });
        if (allComplete) {
          this.completeLogin(authStatus);
          timerSubscription.unsubscribe();
        }
      });
    } else {
      // console.log("Cannot execute login routine because the authStatus.isAuthenticated == false");
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
      // console.log("no local storage, so nexting a bad auth status" )
      this._authStatusSubject$.next(new AuthStatus(null, null, false));
      this.checkLocalStorage$.next(false);
    } else {
      let user: UserAccount = JSON.parse(localStorage.getItem("user"));
      // console.log("userEmail from localStorage:" , user.email)
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
    // console.log("logging out of auth service");
    localStorage.clear();

    this._serviceAuthentications.forEach((serviceAuthentiation: ServiceAuthentication) => {
      serviceAuthentiation.subscription.unsubscribe();
    })

    this.timelogService.logout();
    this.activityCategoryDefinitionService.logout();
    this.userSettingsService.logout();
    this.dayTemplatesService.logout();
    this.dayDataService.logout();
    this.taskService.logout();
    this.notebooksService.logout();
    this.recurringTaskService.logout();
    this.timeViewsService.logout();

    this._authStatusSubject$.next(new AuthStatus(null, null, false));
    // this._authStatusSubject$ = new BehaviorSubject(new AuthStatus(null, null, false));
    // this._authStatusSubject$.next(null);
  }

}
