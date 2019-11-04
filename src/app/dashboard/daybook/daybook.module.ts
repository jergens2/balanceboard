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

import { PointsWidgetSmallComponent } from './widgets/points/points-widget-small/points-widget-small.component';
import { PointsWidgetLargeComponent } from './widgets/points/points-widget-large/points-widget-large.component';

import { DaybookEntryFormComponent } from './daybook-entry-form-mobile/daybook-entry-form.component';
import { TlefActivitiesComponent } from './widgets/timelog/timelog-entry-form/tlef-activities/tlef-activities.component';
import { ActivitySliderBarComponent } from './widgets/timelog/timelog-entry-form/tlef-activities/tlef-activity-slider-bar/activity-slider-bar.component';
import { SleepBatteryComponent } from './widgets/sleep-battery/sleep-battery.component';
import { WakeupSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/wakeup-section.component';
import { DaySectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/time-of-day-section/time-of-day-section.component';
import { BedtimeSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/bedtime-section/bedtime-section.component';
import { DaybookEntryFormSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/daybook-entry-form-section.component';

import { SleepProfileWidgetComponent } from './widgets/sleep-profile-widget/sleep-profile-widget.component';
import { TimelogBodyComponent } from './widgets/timelog/timelog-large/timelog-body/timelog-body.component';
import { TimelogZoomControllerComponent } from './widgets/timelog/timelog-large/timelog-zoom-controller/timelog-zoom-controller.component';
import { WeightLogEntryComponent } from './widgets/weight-log-entry/weight-log-entry.component';
import { TimelogEntryComponent } from './widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry.component';
import { TimelogEntryDisplayComponent } from './widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-display/timelog-entry-display.component';
import { TimelogEntryFormComponent } from './widgets/timelog/timelog-entry-form/timelog-entry-form.component';
import { TlefWakeupTimeComponent } from './widgets/timelog/timelog-entry-form/tlef-wakeup-time/tlef-wakeup-time.component';
import { TlefModifyTimesComponent } from './widgets/timelog/timelog-entry-form/tlef-modify-times/tlef-modify-times.component';
import { TimelogEntryListComponent } from './widgets/timelog/timelog-large/timelog-entry-list/timelog-entry-list.component';


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
    TimelogBodyComponent,
    TimelogZoomControllerComponent,
    WeightLogEntryComponent,
    TimelogEntryDisplayComponent,
    TimelogEntryFormComponent,
    TlefWakeupTimeComponent,
    TlefModifyTimesComponent,
    TimelogEntryListComponent,
  ],
  exports: [
    DaybookEntryFormComponent,
    TimelogEntryFormComponent,
    TlefActivitiesComponent,
    ActivitySliderBarComponent,
  ]
  
})
export class DaybookModule { }
