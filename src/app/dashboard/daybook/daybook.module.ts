import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DaybookComponent } from './daybook.component';
import { CalendarComponent } from './calendar/calendar.component';

import { TimeLogComponent } from './time-log/timelog.component';
import { DailyTaskListWidgetComponent } from './widgets/daily-task-list-widget/daily-task-list-widget.component';
import { DaybookHeaderComponent } from './daybook-header/daybook-header.component';
import { HeatmapViewComponent } from './heatmap-view/heatmap-view.component';
import { TimelogEntryTileComponent } from './time-log/timelog-entry-tile/timelog-entry-tile.component';
import { PrimaryTaskWidgetComponent } from './widgets/primary-objective-widget/primary-objective-widget.component';
import { TaskQueueWidgetComponent } from './widgets/task-queue-widget/task-queue-widget.component';
import { ActivityInputDropdownComponent } from '../../shared/activity-input-dropdown/activity-input-dropdown.component';
import { SharedModule } from '../../shared/shared.module';
import { TimelogEntryFormComponent } from './timelog-entry-form/timelog-entry-form.component';



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
    CalendarComponent,
    TimelogEntryFormComponent,
    TimeLogComponent,
    DailyTaskListWidgetComponent,
    DaybookHeaderComponent,
    HeatmapViewComponent,
    PrimaryTaskWidgetComponent,
    TimelogEntryTileComponent,
    TaskQueueWidgetComponent,
  ],
  exports: [
  ]
})
export class DaybookModule { }
