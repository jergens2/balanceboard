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
import { TimelogLargeComponent } from './widgets/timelog/timelog-large/timelog-large.component';
import { TimelogSmallComponent } from './widgets/timelog/timelog-small/timelog-small.component';
import { CalendarLargeComponent } from './widgets/calendar/calendar-large/calendar-large.component';
import { CalendarSmallComponent } from './widgets/calendar/calendar-small/calendar-small.component';
import { DayStructureModeComponent } from './widgets/timelog/timelog-large/day-structure-mode/day-structure-mode.component';
import { NewChartLineAreaComponent } from './widgets/timelog/timelog-large/day-structure-mode/new-chart-line-area/new-chart-line-area.component';
import { MoveChartLineAreaComponent } from './widgets/timelog/timelog-large/day-structure-mode/move-chart-line-area/move-chart-line-area.component';
import { TimelogChartComponent } from './widgets/timelog/timelog-large/timelog-chart/timelog-chart-large.component';
import { TimelogChartItemComponent } from './widgets/timelog/timelog-large/timelog-chart/timelog-chart-large-row-item/timelog-chart-large-row-item.component';
import { PointsWidgetSmallComponent } from './widgets/points/points-widget-small/points-widget-small.component';
import { PointsWidgetLargeComponent } from './widgets/points/points-widget-large/points-widget-large.component';

import { DaybookEntryFormComponent } from './daybook-entry-form-mobile/daybook-entry-form.component';
import { TlefActivitiesComponent } from './daybook-entry-form-mobile/tlef-activities/tlef-activities.component';
import { ActivitySliderBarComponent } from './daybook-entry-form-mobile/tlef-activities/tlef-activity-slider-bar/activity-slider-bar.component';
import { SleepBatteryComponent } from './widgets/sleep-battery/sleep-battery.component';
import { WakeupSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/wakeup-section.component';
import { DaySectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/time-of-day-section/time-of-day-section.component';
import { BedtimeSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/bedtime-section/bedtime-section.component';
import { DaybookEntryFormSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/daybook-entry-form-section.component';
import { TimelogEntryComponent } from './widgets/timelog/timelog-large/timelog-entry/timelog-entry.component';
import { SleepProfileWidgetComponent } from './widgets/sleep-profile-widget/sleep-profile-widget.component';


@NgModule({
  imports: [
    CommonModule,
    ColorPickerModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SharedModule
  ],
  declarations: [
    DaybookComponent,
    PrimaryTaskWidgetComponent,
    TaskQueueWidgetComponent,
    DailyTaskListSmallComponent,
    DailyTaskListLargeComponent,
    TimelogLargeComponent,
    TimelogSmallComponent,
    CalendarLargeComponent,
    CalendarSmallComponent,
    DayStructureModeComponent,
    NewChartLineAreaComponent,
    MoveChartLineAreaComponent,
    TimelogChartComponent,
    TimelogChartItemComponent,
    PointsWidgetSmallComponent,
    PointsWidgetLargeComponent,
    DaybookEntryFormComponent,
    TlefActivitiesComponent,
    ActivitySliderBarComponent,
    SleepBatteryComponent,
    WakeupSectionComponent,
    DaySectionComponent,
    BedtimeSectionComponent,
    DaybookEntryFormSectionComponent,
    TimelogEntryComponent,
    SleepProfileWidgetComponent,
  ],
  exports: [
    DaybookEntryFormComponent,
    TlefActivitiesComponent,
    ActivitySliderBarComponent,
  ]
  
})
export class DaybookModule { }
