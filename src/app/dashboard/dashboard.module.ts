import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DaybookModule } from './daybook/daybook.module';

import { HomeComponent } from './home/home.component';


import { FinanceComponent } from './finance/finance.component';
import { BudgetComponent } from './finance/budget/budget.component';
import { NetWorthComponent } from './finance/net-worth/net-worth.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



import { RotationDayTemplateComponent } from './scheduling/schedule-rotations/rotation-day-template/rotation-day-template.component';
import { DayTemplatesComponent } from './scheduling/day-templates/day-templates.component';
import { RotationFormComponent } from './scheduling/schedule-rotations/rotation-form/rotation-form.component';


import { DayTemplateWidgetComponent } from './scheduling/day-templates/day-template-widget/day-template-widget.component';

import { ColorPickerModule } from 'ngx-color-picker';
import { NotebooksComponent } from './notebooks/notebooks.component';
import { NotebookEntryComponent } from './notebooks/notebook-entry/notebook-entry.component';
import { TasksComponent } from './tasks/tasks.component';
import { TaskComponent } from './tasks/task/task.component';
import { SchedulingComponent } from './scheduling/scheduling.component';
import { RecurringTasksComponent } from './scheduling/recurring-tasks/recurring-tasks.component';
import { ScheduleRotationsComponent } from './scheduling/schedule-rotations/schedule-rotations.component';

import { SharedModule } from '../shared/shared.module';
import { CategoriesViewComponent } from './tasks/views/categories-view/categories-view.component';
import { ListViewComponent } from './tasks/views/list-view/list-view.component';
import { EisenhowerViewComponent } from './tasks/views/eisenhower-view/eisenhower-view.component';
import { TaskGroupComponent } from './tasks/task-group/task-group.component';
import { NotebookTagsComponent } from './notebooks/notebook-tags/notebook-tags.component';
import { TreemapViewComponent } from './tasks/views/treemap-view/treemap-view.component';
import { CategoriesTaskGroupComponent } from './tasks/views/categories-view/categories-task-group/categories-task-group.component';
import { TreemapTaskGroupComponent } from './tasks/views/treemap-view/treemap-task-group/treemap-task-group.component';
import { TreemapComponent } from './tasks/views/treemap-view/treemap/treemap.component';
import { SchedulePlannerComponent } from './scheduling/schedule-planner/schedule-planner.component';
import { ActivitiesComponent } from './activities/activities.component';
import { SocialComponent } from './social/social.component';
import { ActivityListItemComponent } from './activities/activity-list-item/activity-list-item.component';
import { RoutineComponent } from './activities/routines/routine/routine.component';
import { PointsComponent } from './points/points.component';
import { ActivityDisplayItemComponent } from './activities/activity-display-item/activity-display-item.component';
import { ActivitySchedulingFormComponent } from './activities/activity-display-item/activity-scheduling-form/activity-scheduling-form.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ColorPickerModule,
    DaybookModule,
    SharedModule,
  ],
  declarations: [

    HomeComponent,


    FinanceComponent,
    BudgetComponent,
    NetWorthComponent,

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

    CategoriesViewComponent,
    ListViewComponent,
    EisenhowerViewComponent,
    TaskGroupComponent,
    NotebookTagsComponent,
    TreemapViewComponent,
    CategoriesTaskGroupComponent,
    TreemapTaskGroupComponent,
    TreemapComponent,
    SchedulePlannerComponent,

    ActivitiesComponent,

    SocialComponent,
    ActivityListItemComponent,
    RoutineComponent,
    PointsComponent,
    ActivityDisplayItemComponent,
    ActivitySchedulingFormComponent,

  ],
  providers: [],
  entryComponents: []
})
export class DashboardModule { }
