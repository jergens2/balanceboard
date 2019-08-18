import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DtlToolComponent } from './tools/tool-components/dtl-tool/dtl-tool.component';
import { ToolsComponent } from './tools/tools.component';
import { TimelogEntryFormComponent } from './tools/tool-components/timelog-entry/timelog-entry-form/timelog-entry-form.component';
import { TlefActivitiesComponent } from './tools/tool-components/timelog-entry/timelog-entry-form/tlef-activities/tlef-activities.component';
import { TlefChartComponent } from './tools/tool-components/timelog-entry/timelog-entry-form/tlef-chart/tlef-chart.component';
import { ActivitySliderBarComponent } from './tools/tool-components/timelog-entry/timelog-entry-form/tlef-activities/tlef-activity-slider-bar/activity-slider-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActionItemFormComponent } from './tools/tool-components/action-item-form/action-item-form.component';
import { NotebookEntryFormComponent } from './tools/tool-components/notebook-entry-form/notebook-entry-form.component';
import { SharedModule } from '../shared/shared.module';
import { FutureEventFormComponent } from './tools/tool-components/future-event-form/future-event-form.component';



@NgModule({
  declarations: [
    DtlToolComponent,
    ToolsComponent,


    TlefChartComponent,
    TimelogEntryFormComponent,
    ActivitySliderBarComponent,
    TlefActivitiesComponent,

    ActionItemFormComponent,
    NotebookEntryFormComponent,
    FutureEventFormComponent,
  ],
  exports: [
    DtlToolComponent,
    ToolsComponent,


    TimelogEntryFormComponent,
    ActionItemFormComponent,
    NotebookEntryFormComponent,

  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule
  ]
})
export class ToolsMenuModule { }
