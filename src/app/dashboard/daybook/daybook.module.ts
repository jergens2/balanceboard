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
import { TimelogLargeFrameComponent } from './widgets/timelog/timelog-large-frame/timelog-large-frame.component';
import { TimelogSmallComponent } from './widgets/timelog/timelog-small/timelog-small.component';
import { CalendarLargeComponent } from './widgets/calendar/calendar-large/calendar-large.component';
import { CalendarSmallComponent } from './widgets/calendar/calendar-small/calendar-small.component';

import { PointsWidgetSmallComponent } from './widgets/points/points-widget-small/points-widget-small.component';
import { PointsWidgetLargeComponent } from './widgets/points/points-widget-large/points-widget-large.component';


import { TlefModifyActivitiesComponent } from './widgets/timelog/timelog-entry-form/tlef-parts/tlef-modify-activities/tlef-modify-activities.component';
import { ActivitySliderBarComponent } from './widgets/timelog/timelog-entry-form/tlef-parts/tlef-modify-activities/tlef-activity-slider-bar/activity-slider-bar.component';
import { SleepBatteryWidgetComponent } from './widgets/sleep-battery/small/sleep-battery-widget.component';
// import { WakeupSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/wakeup-section.component';
// import { DaySectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/time-of-day-section/time-of-day-section.component';
// import { BedtimeSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/form-sections/bedtime-section/bedtime-section.component';
// import { DaybookEntryFormSectionComponent } from './daybook-entry-form-mobile/daybook-entry-form-section/daybook-entry-form-section.component';
// import { DaybookEntryFormComponent } from './daybook-entry-form-mobile/daybook-entry-form.component';

import { SleepProfileWidgetComponent } from './widgets/sleep-profile-widget/sleep-profile-widget.component';
import { TimelogBodyComponent } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-body.component';
import { TimelogZoomControllerComponent } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-controller.component';
import { WeightLogEntryComponent } from './widgets/weight-log-entry/weight-log-entry.component';
import { TimelogEntryComponent } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry.component';
import { TimelogEntryFormComponent } from './widgets/timelog/timelog-entry-form/timelog-entry-form.component';
import { TlefWakeupTimeComponent } from './widgets/timelog/timelog-entry-form/tlef-parts/tlef-wakeup-time/tlef-wakeup-time.component';
import { TlefModifyTimesComponent } from './widgets/timelog/timelog-entry-form/tlef-parts/tlef-modify-times/tlef-modify-times.component';
import { TimelogEntryListComponent } from './widgets/timelog/timelog-large-frame/timelog-entry-list/timelog-entry-list.component';
import { SleepProfileFormComponent } from './widgets/sleep-profile-widget/sleep-profile-form/sleep-profile-form.component';
import { SleepProfileDisplayComponent } from './widgets/sleep-profile-widget/sleep-profile-display/sleep-profile-display.component';
import { TimeSelectionColumnComponent } from './widgets/timelog/timelog-large-frame/timelog-body/time-selection-column/time-selection-column.component';
import { TlefViewOnlyComponent } from './widgets/timelog/timelog-entry-form/tlef-parts/tlef-view-only/tlef-view-only.component';
import { TlefBedTimeComponent } from './widgets/timelog/timelog-entry-form/tlef-parts/tlef-bed-time/tlef-bed-time.component';
import { AvailableTimelogItemComponent } from './widgets/timelog/timelog-large-frame/timelog-item-types/available-timelog-item/available-timelog-item.component';
import { SleepProfileLargeComponent } from './widgets/sleep-profile-widget/sleep-profile-large/sleep-profile-large.component';
import { TimeSelectionRowComponent } from './widgets/timelog/timelog-large-frame/timelog-body/time-selection-row/time-selection-row.component';
import { TlefNewCurrentComponent } from './widgets/timelog/timelog-entry-form/tlef-cases/tlef-new-current/tlef-new-current.component';
import { TlefNewPreviousComponent } from './widgets/timelog/timelog-entry-form/tlef-cases/tlef-new-previous/tlef-new-previous.component';
import { TlefNewFutureComponent } from './widgets/timelog/timelog-entry-form/tlef-cases/tlef-new-future/tlef-new-future.component';
import { TlefExistingFutureComponent } from './widgets/timelog/timelog-entry-form/tlef-cases/tlef-existing-future/tlef-existing-future.component';
import { TlefExistingPreviousComponent } from './widgets/timelog/timelog-entry-form/tlef-cases/tlef-existing-previous/tlef-existing-previous.component';
import { TlefNewOrModifyComponent } from './widgets/timelog/timelog-entry-form/tlef-parts/tlef-new-or-modify/tlef-new-or-modify.component';
import { SleepInputFormComponent } from './widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-form.component';
import { DaybookGridItemsBarComponent } from './widgets/timelog/timelog-entry-form/daybook-grid-items-bar/daybook-grid-items-bar.component';
import { TlefNewCurrentFutureComponent } from './widgets/timelog/timelog-entry-form/tlef-cases/tlef-new-current-future/tlef-new-current-future.component';
import { TlefExistingCurrentComponent } from './widgets/timelog/timelog-entry-form/tlef-cases/tlef-existing-current/tlef-existing-current.component';


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
    TimelogLargeFrameComponent,
    TimelogSmallComponent,
    CalendarLargeComponent,
    CalendarSmallComponent,
    PointsWidgetSmallComponent,
    PointsWidgetLargeComponent,

    TlefModifyActivitiesComponent,
    ActivitySliderBarComponent,
    SleepBatteryWidgetComponent,
    // DaybookEntryFormComponent,
    // WakeupSectionComponent,
    // DaySectionComponent,
    // BedtimeSectionComponent,
    // DaybookEntryFormSectionComponent,
    TimelogEntryComponent,
    SleepProfileWidgetComponent,
    TimelogBodyComponent,
    TimelogZoomControllerComponent,
    WeightLogEntryComponent,
    TimelogEntryFormComponent,
    TlefWakeupTimeComponent,
    TlefModifyTimesComponent,
    TimelogEntryListComponent,
    SleepProfileFormComponent,
    SleepProfileDisplayComponent,
    TimeSelectionColumnComponent,
    TlefViewOnlyComponent,
    TlefBedTimeComponent,
    AvailableTimelogItemComponent,
    SleepProfileLargeComponent,
    TimeSelectionRowComponent,
    TlefNewCurrentComponent,
    TlefNewPreviousComponent,
    TlefNewFutureComponent,
    TlefExistingFutureComponent,
    TlefExistingPreviousComponent,
    TlefNewOrModifyComponent,
    SleepInputFormComponent,
    DaybookGridItemsBarComponent,
    TlefNewCurrentFutureComponent,
    TlefExistingCurrentComponent,
  ],
  exports: [
    // DaybookEntryFormComponent,
    TimelogEntryFormComponent,
    SleepInputFormComponent,
    TlefModifyActivitiesComponent,
    ActivitySliderBarComponent,
  ]
  
})
export class DaybookModule { }
