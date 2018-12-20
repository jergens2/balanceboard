import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ColorPickerModule } from 'ngx-color-picker';

import { TimelogComponent } from './timelog.component';
import { TimeMarkFormComponent } from './time-mark-form/time-mark-form.component';
import { ActivityFormComponent } from './time-mark-form/activity-form/activity-form.component';
import { ActivitiesComponent } from './activities/activities.component';
import { ActivityComponent } from './activities/activity/activity.component';
import { TimelogChartComponent } from './timelog-chart/timelog-chart.component';
import { TimelogCalendarComponent } from './timelog-calendar/timelog-calendar.component';
import { TimelogListComponent } from './timelog-list/timelog-list.component';
import { NewActivityFormComponent } from './activities/new-activity-form/new-activity-form.component';
import { UpdateActivityFormComponent } from './activities/update-activity-form/update-activity-form.component';
import { ActivityListItemComponent } from './activities/new-activity-form/activity-list-item/activity-list-item.component';
import { UpdateTimeMarkComponent } from './timelog-list/update-time-mark/update-time-mark.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ColorPickerModule
  ],
  declarations: [
    TimelogComponent,
    TimeMarkFormComponent,
    ActivityFormComponent,
    ActivitiesComponent,
    ActivityComponent,
    TimelogChartComponent,
    TimelogCalendarComponent,
    TimelogListComponent,
    NewActivityFormComponent,
    UpdateActivityFormComponent,
    ActivityListItemComponent,
    UpdateTimeMarkComponent
  ],
  providers: []
})
export class TimelogModule { }
