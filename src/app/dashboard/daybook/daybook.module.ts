import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DayDataComponent } from './daybook.component';
import { CalendarComponent } from './calendar/calendar.component';

import { TimeLogComponent } from './time-log/timelog.component';
import { DayDataHeaderComponent } from './daybook-header/daybook-header.component';
import { HeatmapViewComponent } from './heatmap-view/heatmap-view.component';
import { TimelogEntryTileComponent } from './time-log/timelog-entry/timelog-entry-tile/timelog-entry-tile.component';
import { PrimaryTaskWidgetComponent } from './widgets/primary-objective-widget/primary-objective-widget.component';
import { TaskQueueWidgetComponent } from './widgets/task-queue-widget/task-queue-widget.component';
import { SharedModule } from '../../shared/shared.module';




@NgModule({
  imports: [
    CommonModule,
    ColorPickerModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SharedModule
  ],
  declarations: [
    DayDataComponent,
    CalendarComponent,
    TimeLogComponent,
    DayDataHeaderComponent,
    HeatmapViewComponent,
    PrimaryTaskWidgetComponent,
    TimelogEntryTileComponent,
    TaskQueueWidgetComponent,
  ],
  exports: [
  ]
})
export class DayDataModule { }
