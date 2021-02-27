import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DtlToolComponent } from './tools/tool-components/dtl-tool/dtl-tool.component';
import { ToolsComponent } from './toolbox.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActionItemFormComponent } from './tools/tool-components/action-item-form/action-item-form.component';
import { NotebookEntryFormComponent } from '../app-pages/notes/notebook-entry/notebook-entry-form/notebook-entry-form.component';
import { SharedModule } from '../shared/shared.module';
import { FutureEventFormComponent } from './tools/tool-components/future-event-form/future-event-form.component';
import { DaybookModule } from '../app-pages/daybook/daybook.module';
import { TLEFModule } from '../app-pages/daybook/widgets/timelog/timelog-entry-form/tlef.module';



@NgModule({
  declarations: [
    DtlToolComponent,
    ToolsComponent,

    ActionItemFormComponent,
    NotebookEntryFormComponent,
    FutureEventFormComponent,
  ],
  exports: [
    DtlToolComponent,
    ToolsComponent,
    ActionItemFormComponent,
    NotebookEntryFormComponent,

  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule,
    DaybookModule,
    TLEFModule,
  ]
})
export class ToolsMenuModule { }
