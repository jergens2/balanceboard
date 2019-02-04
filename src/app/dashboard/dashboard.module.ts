import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { HomeComponent } from './home/home.component';
import { IvyleeCreationComponent } from './productivity/ivylee/ivylee-creation/ivylee-creation.component';
import { IvyleeManageComponent } from './productivity/ivylee/ivylee-manage/ivylee-manage.component';
import { HealthComponent } from './health/health.component';
import { BodyWeightComponent } from './health/body-weight/body-weight.component';
import { BuildProfileComponent } from './health/build-profile/build-profile.component';
import { HeightFormComponent } from './health/body-weight/height-form/height-form.component';
import { FinanceComponent } from './finance/finance.component';
import { BudgetComponent } from './finance/budget/budget.component';
import { NetWorthComponent } from './finance/net-worth/net-worth.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ColorPickerModule } from 'ngx-color-picker';

import { TimelogModule } from './timelog/timelog.module';
import { DaybookComponent } from './daybook/daybook.component';
import { CalendarComponent } from './daybook/calendar/calendar.component';

import { ActivitiesComponent } from './activities/activities.component';
import { ActivityFormListItemComponent } from './activities/new-activity-form/activity-form-list-item/activity-form-list-item.component';
import { ActivityListItemComponent } from './activities/activity-list-item/activity-list-item.component';
import { ActivityDisplayComponent } from './activities/activity-display/activity-display.component';
import { ActivityYearViewComponent } from './activities/activity-display/activity-year-view/activity-year-view.component';
import { MonthPlannerComponent } from './month-planner/month-planner.component';
import { YearPlannerComponent } from './year-planner/year-planner.component';
import { ActivitySixWeekViewComponent } from './activities/activity-display/activity-six-week-view/activity-six-week-view.component';




@NgModule({
  imports: [
    TimelogModule,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ColorPickerModule,
    NgbModule.forRoot(),
  ],
  declarations: [
    HomeComponent,
    IvyleeCreationComponent,
    IvyleeManageComponent,
    HealthComponent,
    BodyWeightComponent,
    BuildProfileComponent,
    HeightFormComponent,
    FinanceComponent,
    BudgetComponent,
    NetWorthComponent,
    DaybookComponent,
    CalendarComponent,
    ActivitiesComponent,
    ActivityListItemComponent,
    ActivityFormListItemComponent,
    ActivityDisplayComponent,
    ActivityYearViewComponent,
    MonthPlannerComponent,
    YearPlannerComponent,
    ActivitySixWeekViewComponent,
    
    
  ],
  providers: [],
  entryComponents: []
})
export class DashboardModule { }
