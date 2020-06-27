import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelogLargeFrameComponent } from './timelog-large-frame/timelog-large-frame.component';
import { TimelogSmallComponent } from './timelog-small/timelog-small.component';
import { TimelogEntryComponent } from './timelog-large-frame/timelog-body/timelog-entry/timelog-entry.component';
import { TimelogZoomControllerComponent } from './timelog-large-frame/timelog-zoom-controller/timelog-zoom-controller.component';
import { TimelogBodyComponent } from './timelog-large-frame/timelog-body/timelog-body.component';
import { TimelogEntryListComponent } from './timelog-large-frame/timelog-entry-list/timelog-entry-list.component';
import { TimeSelectionColumnComponent } from './timelog-large-frame/timelog-body/time-selection-column/time-selection-column.component';
import { AvailableTimelogItemComponent } from './timelog-large-frame/timelog-body/available-timelog-item/available-timelog-item.component';
import { TimeSelectionRowComponent } from './timelog-large-frame/timelog-body/time-selection-row/time-selection-row.component';
import { TLEFModule } from './timelog-entry-form/tlef.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../../../shared/shared.module';
import { DrawTleComponent } from './timelog-large-frame/timelog-body/draw-tle/draw-tle.component';


@NgModule({
  declarations: [
    TimelogLargeFrameComponent,
    TimelogSmallComponent,
    TimelogEntryComponent,
    TimelogBodyComponent,
    TimelogZoomControllerComponent,
    TimelogEntryListComponent,
    TimelogLargeFrameComponent,
    TimeSelectionColumnComponent,
    AvailableTimelogItemComponent,
    TimeSelectionRowComponent,
    DrawTleComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    SharedModule,
    TLEFModule,
  ],
  exports: [
    TimelogLargeFrameComponent,
    TimelogSmallComponent
  ]
})
export class TimelogModule { }
