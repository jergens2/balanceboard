import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


import { TimelogComponent } from './timelog.component';
import { TimeMarkFormComponent } from './time-mark-form/time-mark-form.component';

import { TimelogChartComponent } from './timelog-chart/timelog-chart.component';
import { TimelogCalendarComponent } from './timelog-calendar/timelog-calendar.component';
import { TimelogListComponent } from './timelog-list/timelog-list.component';


import { ActivityFormComponent } from './time-mark-form/activity-form/activity-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  declarations: [
    TimelogComponent,
    TimeMarkFormComponent,
    ActivityFormComponent,
    TimelogChartComponent,
    TimelogCalendarComponent,
    TimelogListComponent,
  ],
  providers: []
})
export class TimelogModule { }
