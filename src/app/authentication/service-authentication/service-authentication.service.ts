import { Injectable } from '@angular/core';
import { ActivityCategoryDefinitionService } from '../../dashboard/activities/api/activity-category-definition.service';

import { UserSettingsService } from '../../shared/document-definitions/user-account/user-settings/user-settings.service';
import { DayTemplatesService } from '../../dashboard/scheduling/day-templates/day-templates.service';

import { NotebooksService } from '../../dashboard/notebooks/notebooks.service';
import { TaskService } from '../../dashboard/tasks/task.service';
import { RoutineDefinitionService } from '../../dashboard/activities/routines/api/routine-definition.service';


import { SocialService } from '../../shared/document-definitions/user-account/social.service';
import { DaybookHttpRequestService } from '../../dashboard/daybook/api/daybook-http-request.service';
import { DaybookControllerService } from '../../dashboard/daybook/controller/daybook-controller.service';
import { AuthStatus } from '../auth-status.class';
import { Observable, Subject, Subscription, timer, forkJoin, BehaviorSubject, merge } from 'rxjs';
import { ServiceAuthentication } from './service-authentication.class';
import { ScheduleRotationsService } from '../../dashboard/scheduling/schedule-rotations/schedule-rotations.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceAuthenticationService {

  constructor(
    private activityCategoryDefinitionService: ActivityCategoryDefinitionService,
    // private activityDayDataService: ActivityDayDataService,
    // private timelogService: TimelogService,
    private userSettingsService: UserSettingsService,
    private dayTemplatesService: DayTemplatesService,
    // private dayDataService: DayDataService,
    private notebooksService: NotebooksService,
    private taskService: TaskService,
    private routineDefinitionService: RoutineDefinitionService,
    // private timeViewsService: TimeViewsService,
    // private dailyTaskListService: DailyTaskListService,
    private socialService: SocialService,
    private daybookHttpRequestService: DaybookHttpRequestService,
    private daybookControllerService: DaybookControllerService,
    private scheduleRotationService: ScheduleRotationsService,

  ) {



  }

  public logout() {
    this.serviceAuthentications.forEach((serviceAuthentication) => {
      console.log("Logging out of " + serviceAuthentication.name);
      serviceAuthentication.logout();
    });
    this.serviceAuthentications = [];
  }

  private serviceAuthentications: ServiceAuthentication[] = [];

  public loginServices$(authStatus: AuthStatus): Observable<boolean> {

    let serviceAuthentications: ServiceAuthentication[] = [];
    let activityCategoryDefinitionSA: ServiceAuthentication = new ServiceAuthentication("ActivityCategoryDefinition", this.activityCategoryDefinitionService);
    let routineDefinitionSA: ServiceAuthentication = new ServiceAuthentication("RoutineDefinition", this.routineDefinitionService);

    let dayTemplatesSA: ServiceAuthentication = new ServiceAuthentication("DayTemplates", this.dayTemplatesService);
    let scheduleRotationSA: ServiceAuthentication = new ServiceAuthentication("ScheduleRotation", this.scheduleRotationService);
    let daybookHttpSA: ServiceAuthentication = new ServiceAuthentication("DaybookHttp", this.daybookHttpRequestService);


    daybookHttpSA.setChild(new ServiceAuthentication("Daybook", this.daybookControllerService));
    scheduleRotationSA.setChild(daybookHttpSA);
    dayTemplatesSA.setChild(scheduleRotationSA);
    routineDefinitionSA.setChild(dayTemplatesSA)
    activityCategoryDefinitionSA.setChild(routineDefinitionSA);

    serviceAuthentications.push(activityCategoryDefinitionSA);


    serviceAuthentications.push(new ServiceAuthentication("Notes", this.notebooksService));
    serviceAuthentications.push(new ServiceAuthentication("Tasks", this.taskService));
    serviceAuthentications.push(new ServiceAuthentication("Social", this.socialService));

    serviceAuthentications.push(new ServiceAuthentication("UserSettings", this.userSettingsService));


    let loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    serviceAuthentications.forEach((sa) => {
      sa.login$(authStatus);
    });



    let timerSubscription: Subscription = new Subscription();
    timerSubscription = timer(0, 300).subscribe((val) => {
      let loginComplete: boolean = true;
      serviceAuthentications.map((sa) => { return sa.loginComplete }).forEach((val) => {
        if (val === false) {
          loginComplete = false;
        }
      });
      // serviceAuthentications.forEach((item)=>{
      //   console.log("SA: " + item.name + " logged in? " + item.loginComplete)
      // });
      this.serviceAuthentications = serviceAuthentications;
      if (loginComplete) {
        loginComplete$.next(loginComplete);
        timerSubscription.unsubscribe();
      }
    });



    return loginComplete$.asObservable();
  }


}
