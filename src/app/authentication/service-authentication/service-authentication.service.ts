import { Injectable } from '@angular/core';
import { ActivityCategoryDefinitionService } from '../../shared/document-definitions/activity-category-definition/activity-category-definition.service';
import { ActivityDayDataService } from '../../shared/document-data/activity-day-data/activity-day-data.service';
import { UserSettingsService } from '../../shared/document-definitions/user-account/user-settings/user-settings.service';
import { DayTemplatesService } from '../../dashboard/scheduling/day-templates/day-templates.service';
import { DayDataService } from '../../shared/document-data/day-data/day-data.service';
import { NotebooksService } from '../../dashboard/notebooks/notebooks.service';
import { TaskService } from '../../dashboard/tasks/task.service';
import { RecurringTasksService } from '../../shared/document-definitions/recurring-task-definition/recurring-tasks.service';
import { TimeViewsService } from '../../shared/time-views/time-views.service';
import { DailyTaskListService } from '../../shared/document-data/daily-task-list/daily-task-list.service';
import { SocialService } from '../../shared/document-definitions/user-account/social.service';
import { DaybookHttpRequestService } from '../../dashboard/daybook/api/daybook-http-request.service';
import { DaybookService } from '../../dashboard/daybook/daybook.service';
import { TimelogService } from '../../shared/document-data/timelog-entry/timelog.service';
import { AuthStatus } from '../auth-status.class';
import { Observable, Subject, Subscription, timer, forkJoin } from 'rxjs';
import { ServiceAuthentication } from './service-authentication.class';
import { ScheduleRotationsService } from '../../dashboard/scheduling/schedule-rotations/schedule-rotations.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceAuthenticationService {

  constructor(
    private activityCategoryDefinitionService: ActivityCategoryDefinitionService,
    private activityDayDataService: ActivityDayDataService,
    private timelogService: TimelogService,
    // private userSettingsService: UserSettingsService,
    private dayTemplatesService: DayTemplatesService,
    // private dayDataService: DayDataService,
    private notebooksService: NotebooksService,
    private taskService: TaskService,
    private recurringTaskService: RecurringTasksService,
    // private timeViewsService: TimeViewsService,
    private dailyTaskListService: DailyTaskListService,
    private socialService: SocialService,
    private daybookHttpRequestService: DaybookHttpRequestService,
    private daybookService: DaybookService,
    private scheduleRotationService: ScheduleRotationsService,
    
    ) {



  }

  public logout() {

  }

  public loginServices$(authStatus: AuthStatus): Observable<boolean> {


    console.log("Service logger inner: authStatus", authStatus);

    let serviceAuthentications: ServiceAuthentication[] = [];
    let activityCategoryDefinitionSA: ServiceAuthentication = new ServiceAuthentication("ActivityCategoryDefinition", this.activityCategoryDefinitionService);
    activityCategoryDefinitionSA.addChild(new ServiceAuthentication("Timelog", this.timelogService));
    activityCategoryDefinitionSA.addChild(new ServiceAuthentication("ActivityDayData", this.activityDayDataService));
    serviceAuthentications.push(activityCategoryDefinitionSA);


    let daybookHttpSA: ServiceAuthentication = new ServiceAuthentication("DaybookHttp", this.daybookHttpRequestService);
    daybookHttpSA.addChild(new ServiceAuthentication("Daybook", this.daybookService));
    let dayTemplatesSA: ServiceAuthentication = new ServiceAuthentication("DayTemplates", this.dayTemplatesService);
    dayTemplatesSA.addChild(daybookHttpSA);
    dayTemplatesSA.addChild(new ServiceAuthentication("ScheduleRotation", this.scheduleRotationService));
    serviceAuthentications.push(dayTemplatesSA);

    let recurringTaskDefinitionsSA: ServiceAuthentication = new ServiceAuthentication("RecurringTaskDefinition", this.recurringTaskService);
    recurringTaskDefinitionsSA.addChild(new ServiceAuthentication("DailyTaskList", this.dailyTaskListService));
    serviceAuthentications.push(recurringTaskDefinitionsSA);

    serviceAuthentications.push(new ServiceAuthentication("Notes", this.notebooksService));
    serviceAuthentications.push(new ServiceAuthentication("Tasks", this.taskService));
    serviceAuthentications.push(new ServiceAuthentication("Social", this.socialService));
    
    
    let loginComplete$: Subject<boolean> = new Subject();
    forkJoin(serviceAuthentications.map<Observable<boolean>>((serviceAuthentication) => { return serviceAuthentication.login$(authStatus) }))
      .subscribe((values) => {
        console.log("Fork join emits val: ", values);
        let allComplete: boolean = true;
        values.forEach((value) => {
          if (value.valueOf() == false) {
            allComplete = false;
          }
        })
        console.log("all complete then? : ", allComplete);
        loginComplete$.next(allComplete);
      });


    return loginComplete$.asObservable();

    // private _serviceAuthentications: ServiceAuthentication[] = [




    //     { name: "timeViews", subscription: new Subscription, isAuthenticated: false, },

    //     { name: "social", subscription: new Subscription, isAuthenticated: false, },





    /**
     * 
     * 
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
            // console.log("Not authenticated: " + val.name);
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
     * 
     * 
     * 
     */



  }


}
