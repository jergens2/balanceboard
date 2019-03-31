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

import { DaybookComponent } from './daybook/daybook.component';
import { CalendarComponent } from './daybook/calendar/calendar.component';

import { ActivitiesComponent } from './activities/activities.component';
import { ActivityListItemComponent } from './activities/activity-list-item/activity-list-item.component';
import { ActivityDisplayComponent } from './activities/activity-display/activity-display.component';
import { ActivityYearViewComponent } from './activities/activity-display/activity-year-view/activity-year-view.component';
import { MonthPlannerComponent } from './month-planner/month-planner.component';
import { YearPlannerComponent } from './year-planner/year-planner.component';
import { ActivitySixWeekViewComponent } from './activities/activity-display/activity-six-week-view/activity-six-week-view.component';
import { UserDefinedActivityFormComponent } from './activities/user-defined-activity-form/user-defined-activity-form.component';
import { TimeSegmentFormComponent } from './daybook/time-segment-form/time-segment-form.component';
import { ActivitiesDefaultViewComponent } from './activities/default-view/default-view.component';
import { IdeaLogComponent } from './idea-log/idea-log.component';
import { TimeLogComponent } from './daybook/time-log/time-log.component';
import { DailyTaskListComponent } from './daybook/daily-task-list/daily-task-list.component';
import { JournalComponent } from './daybook/journal/journal.component';
import { MonthOfYearComponent } from './year-planner/month-of-year/month-of-year.component';
import { ActivityInputDropdownComponent } from './activities/activity-input-dropdown/activity-input-dropdown.component';
import { ActivitiesListComponent } from './activities/activities-list/activities-list.component';
import { HeatmapViewComponent } from './daybook/heatmap-view/heatmap-view.component';
import { ScheduleComponent } from './scheduling/schedule.component';
import { DaybookHeaderComponent } from './daybook/daybook-header/daybook-header.component';
import { RotationDayTemplateComponent } from './scheduling/rotation-day-template/rotation-day-template.component';
import { DayTemplatesComponent } from './scheduling/day-templates/day-templates.component';




@NgModule({
  imports: [
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
    ActivityDisplayComponent,
    ActivityYearViewComponent,
    MonthPlannerComponent,
    YearPlannerComponent,
    ActivitySixWeekViewComponent,
    UserDefinedActivityFormComponent,
    TimeSegmentFormComponent,
    ActivitiesDefaultViewComponent,
    IdeaLogComponent,
    TimeLogComponent,
    DailyTaskListComponent,
    JournalComponent,
    MonthOfYearComponent,
    ActivityInputDropdownComponent,
    ActivitiesListComponent,
    HeatmapViewComponent,
    ScheduleComponent,
    DaybookHeaderComponent,
    RotationDayTemplateComponent,
    DayTemplatesComponent
    
    
  ],
  providers: [],
  entryComponents: []
})
export class DashboardModule { }
