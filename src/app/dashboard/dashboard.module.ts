import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DaybookModule } from './daybook/daybook.module';

import { HomeComponent } from './home/home.component';

import { HealthComponent } from './health/health.component';
import { BodyWeightComponent } from './health/body-weight/body-weight.component';
import { BuildProfileComponent } from './health/build-profile/build-profile.component';
import { HeightFormComponent } from './health/body-weight/height-form/height-form.component';
import { FinanceComponent } from './finance/finance.component';
import { BudgetComponent } from './finance/budget/budget.component';
import { NetWorthComponent } from './finance/net-worth/net-worth.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


import { ActivitiesComponent } from './activities/activities.component';
import { ActivityListItemComponent } from './activities/activity-list-item/activity-list-item.component';
import { ActivityDisplayComponent } from './activities/activity-display/activity-display.component';
import { ActivityYearViewComponent } from './activities/activity-display/activity-year-view/activity-year-view.component';
import { MonthPlannerComponent } from './month-planner/month-planner.component';
import { YearPlannerComponent } from './year-planner/year-planner.component';
import { ActivitySixWeekViewComponent } from './activities/activity-display/activity-six-week-view/activity-six-week-view.component';
import { UserDefinedActivityFormComponent } from './activities/user-defined-activity-form/user-defined-activity-form.component';

import { ActivitiesDefaultViewComponent } from './activities/default-view/default-view.component';


import { MonthOfYearComponent } from './year-planner/month-of-year/month-of-year.component';

import { ActivitiesListComponent } from './activities/activities-list/activities-list.component';




import { ActivityGoalsWidgetComponent } from './activities/default-view/activity-goals-widget/activity-goals-widget.component';
import { ActivityPlanningComponent } from './activities/activity-display/activity-planning/activity-planning.component';
import { InstancesListComponent } from './activities/activity-display/instances-list/instances-list.component';
import { ActivityJournalComponent } from './activities/activity-display/activity-journal/activity-journal.component';
import { DayOfWeekComponent } from './activities/default-view/day-of-week/day-of-week.component';

import { RotationDayTemplateComponent } from './scheduling/rotation-day-template/rotation-day-template.component';
import { DayTemplatesComponent } from './scheduling/day-templates/day-templates.component';
import { RotationFormComponent } from './scheduling/rotation-form/rotation-form.component';


import { DayTemplateWidgetComponent } from './scheduling/day-templates/day-template-widget/day-template-widget.component';

import { ColorPickerModule } from 'ngx-color-picker';
import { NotebooksComponent } from './notebooks/notebooks.component';
import { NotebookEntryComponent } from './notebooks/notebook-entry/notebook-entry.component';
import { TasksComponent } from './tasks/tasks.component';
import { TaskComponent } from './tasks/task/task.component';
import { SchedulingComponent } from './scheduling/scheduling.component';
import { RecurringTasksComponent } from './scheduling/recurring-tasks/recurring-tasks.component';
import { ScheduleRotationsComponent } from './scheduling/schedule-rotations/schedule-rotations.component';






@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ColorPickerModule,
    DaybookModule
  ],
  declarations: [

    HomeComponent,

    HealthComponent,
    BodyWeightComponent,
    BuildProfileComponent,
    HeightFormComponent,
    FinanceComponent,
    BudgetComponent,
    NetWorthComponent,



    ActivitiesComponent,
    ActivityListItemComponent,
    ActivityDisplayComponent,
    ActivityYearViewComponent,
    MonthPlannerComponent,
    YearPlannerComponent,
    ActivitySixWeekViewComponent,
    UserDefinedActivityFormComponent,

    ActivitiesDefaultViewComponent,


    MonthOfYearComponent,
    ActivitiesListComponent,

    ActivityGoalsWidgetComponent,
    ActivityPlanningComponent,
    InstancesListComponent,
    ActivityJournalComponent,
    DayOfWeekComponent,

    RotationDayTemplateComponent,
    DayTemplatesComponent,
    RotationFormComponent,

    DayTemplateWidgetComponent,

    NotebooksComponent,
    NotebookEntryComponent,
    
    TasksComponent,
    
    TaskComponent,
    
    SchedulingComponent,
    ScheduleRotationsComponent,
    RecurringTasksComponent,
    
  ],
  providers: [],
  entryComponents: []
})
export class DashboardModule { }
