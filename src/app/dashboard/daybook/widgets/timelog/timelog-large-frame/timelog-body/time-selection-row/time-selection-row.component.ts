import { Component, OnInit, Input } from '@angular/core';
import { TimeSelectionRow } from './time-selection-row.class';

import { faEdit, faTrash, faCheck, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import * as moment from 'moment';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogDelineator, TimelogDelineatorType } from '../timelog-delineator.class';

@Component({
  selector: 'app-time-selection-row',
  templateUrl: './time-selection-row.component.html',
  styleUrls: ['./time-selection-row.component.css']
})
export class TimeSelectionRowComponent implements OnInit {


  @Input() row: TimeSelectionRow;

  constructor(private daybookService: DaybookDisplayService) { }

  public get showDelineator(): boolean {
    return this.row.hasMarkedDelineator || this.row.isDrawing;
  }

  ngOnInit() {
    if (this.row.markedDelineator) {
      this._editTime = this.row.markedDelineator.time;
    }

    if (this.row.isAvailable) {

      // console.log("RoW SECTION START AND END: " + this.row.earliestAvailability.format('hh:mm a') + " to " + this.row.latestAvailability.format('hh:mm a'))
    }
  }

  faCheck = faCheck;
  faEdit = faEdit;
  faTrash = faTrash;

  private _editTime: moment.Moment;


  public onEditTimeChanged(time: moment.Moment) {
    this._editTime = time;
  }

  public onClickDelineator(row: TimeSelectionRow) {
    const delineator = row.markedDelineator;
    if (delineator.delineatorType === TimelogDelineatorType.WAKEUP_TIME) {
      this.daybookService.openWakeupTime();
    } else if (delineator.delineatorType === TimelogDelineatorType.FALLASLEEP_TIME) {
      this.daybookService.openFallAsleepTime();
    } else if (delineator.delineatorType === TimelogDelineatorType.NOW) {
      this.daybookService.openNewCurrentTimelogEntry();
    } else if (delineator.delineatorType === TimelogDelineatorType.TIMELOG_ENTRY_START
      || delineator.delineatorType === TimelogDelineatorType.TIMELOG_ENTRY_END) {
      this.daybookService.openTLEDelineator(delineator);
    }
  }

  public onClickSaveEdit() {
    // console.log("on click save edit");
    this.row.updateSavedDelineator(this._editTime);
  }
  public onClickDelete() {
    this.row.deleteDelineator(this.row.markedDelineator.time);
  }



}
