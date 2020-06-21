import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DaybookComponent } from './daybook.component';

import { PrimaryTaskWidgetComponent } from './widgets/primary-objective-widget/primary-objective-widget.component';
import { TaskQueueWidgetComponent } from './widgets/task-queue-widget/task-queue-widget.component';
import { SharedModule } from '../../shared/shared.module';

import { DailyTaskListSmallComponent } from './widgets/daily-task-list/daily-task-list-small/daily-task-list-small.component';
import { DailyTaskListLargeComponent } from './widgets/daily-task-list/daily-task-list-large/daily-task-list-large.component';
import { CalendarLargeComponent } from './widgets/calendar/calendar-large/calendar-large.component';
import { CalendarSmallComponent } from './widgets/calendar/calendar-small/calendar-small.component';
import { PointsWidgetSmallComponent } from './widgets/points/points-widget-small/points-widget-small.component';
import { PointsWidgetLargeComponent } from './widgets/points/points-widget-large/points-widget-large.component';
import { SleepBatteryWidgetComponent } from './widgets/sleep-battery/small/sleep-battery-widget.component';
import { SleepProfileWidgetComponent } from './widgets/sleep-profile-widget/sleep-profile-widget.component';
import { WeightLogEntryComponent } from './widgets/weight-log-entry/weight-log-entry.component';
import { SleepProfileFormComponent } from './widgets/sleep-profile-widget/sleep-profile-form/sleep-profile-form.component';
import { SleepProfileDisplayComponent } from './widgets/sleep-profile-widget/sleep-profile-display/sleep-profile-display.component';
import { SleepProfileLargeComponent } from './widgets/sleep-profile-widget/sleep-profile-large/sleep-profile-large.component';
import { TimelogModule } from './widgets/timelog/timelog.module';
import { TLEFModule } from './widgets/timelog/timelog-entry-form/tlef.module';
import { EnergyChartComponent } from './widgets/sleep-profile-widget/sleep-profile-large/energy-chart/energy-chart.component';



@NgModule({
  imports: [
    CommonModule,
    ColorPickerModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SharedModule,
    TimelogModule,
    TLEFModule,
  ],
  declarations: [
    DaybookComponent,
    PrimaryTaskWidgetComponent,
    TaskQueueWidgetComponent,
    DailyTaskListSmallComponent,
    DailyTaskListLargeComponent,
    CalendarLargeComponent,
    CalendarSmallComponent,
    PointsWidgetSmallComponent,
    PointsWidgetLargeComponent,
    SleepBatteryWidgetComponent,
    SleepProfileWidgetComponent,
    WeightLogEntryComponent,
    SleepProfileFormComponent,
    SleepProfileDisplayComponent,
    SleepProfileLargeComponent,
    EnergyChartComponent,

    
  ],

})
export class DaybookModule { }
