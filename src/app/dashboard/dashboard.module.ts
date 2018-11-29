import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TimeService } from './home/time.service';
import { HomeService } from './home/home.service';
import { TaskService } from './productivity/ivylee/task.service';
import { GenericDataEntryService } from './generic-data/generic-data-entry.service';
import { HealthService } from './health/health.service';
import { FinanceService } from './finance/finance.service';

import { HomeComponent } from './home/home.component';
import { MonthViewComponent } from './home/widgets/month-view/month-view.component';
import { DayViewComponent } from './home/widgets/day-view/day-view.component';
import { YearViewComponent } from './home/widgets/year-view/year-view.component';
import { EventFormComponent } from './home/widgets/day-view/event-form/event-form.component';
import { IvyleeCreationComponent } from './productivity/ivylee/ivylee-creation/ivylee-creation.component';
import { IvyleeManageComponent } from './productivity/ivylee/ivylee-manage/ivylee-manage.component';
import { IvyleeWidgetComponent } from './home/widgets/ivylee-widget/ivylee-widget.component';
import { BodyWeightWidgetComponent } from './home/widgets/body-weight/body-weight-widget.component';
import { HealthComponent } from './health/health.component';
import { BodyWeightComponent } from './health/body-weight/body-weight.component';
import { BuildProfileComponent } from './health/build-profile/build-profile.component';
import { HeightFormComponent } from './health/body-weight/height-form/height-form.component';
import { FinanceComponent } from './finance/finance.component';
import { BudgetComponent } from './finance/budget/budget.component';
import { NetWorthComponent } from './finance/net-worth/net-worth.component';
import { TimelogComponent } from './timelog/timelog.component';
import { TimelogService } from './timelog/timelog.service';
import { TimeMarkFormComponent } from './timelog/time-mark-form/time-mark-form.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActivityFormComponent } from './timelog/time-mark-form/activity-form/activity-form.component';
import { ActivitiesComponent } from './timelog/activities/activities.component';
import { ActivityComponent } from './timelog/activities/activity/activity.component';
import { TimelogChartComponent } from './timelog/timelog-chart/timelog-chart.component';




@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgbModule.forRoot(),
  ],
  declarations: [
    HomeComponent,
    MonthViewComponent,
    DayViewComponent,
    YearViewComponent,
    EventFormComponent,
    IvyleeCreationComponent,
    IvyleeManageComponent,
    IvyleeWidgetComponent,
    BodyWeightWidgetComponent,
    HealthComponent,
    BodyWeightComponent,
    BuildProfileComponent,
    HeightFormComponent,
    FinanceComponent,
    BudgetComponent,
    NetWorthComponent,
    TimelogComponent,
    TimeMarkFormComponent,
    ActivityFormComponent,
    ActivitiesComponent,
    ActivityComponent,
    TimelogChartComponent
  ],
  providers: [
    TimeService, 
    HomeService,
    TimelogService,
    TaskService,
    GenericDataEntryService,
    HealthService,
    FinanceService,
  ],
  entryComponents: [
    EventFormComponent
  ]
})
export class DashboardModule { }
