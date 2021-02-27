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

  faCheck = faCheck;
  faEdit = faEdit;
  faTrash = faTrash;


  constructor(private daybookService: DaybookDisplayService) { }

  public get showDelineator(): boolean {
    return this.row.hasMarkedDelineator || this.row.isDrawing;
  }

  ngOnInit() {
  }


  public onClickDelineator(row: TimeSelectionRow) {
    const delineator = row.markedDelineator;
    if (delineator.delineatorType === TimelogDelineatorType.WAKEUP_TIME) {
      this.daybookService.openWakeupTime();
    } else if (delineator.delineatorType === TimelogDelineatorType.FALLASLEEP_TIME) {
      this.daybookService.openFallAsleepTime();
    } else if (delineator.delineatorType === TimelogDelineatorType.NOW) {
      this.daybookService.onClickNowDelineator();
    } else if (delineator.delineatorType === TimelogDelineatorType.TIMELOG_ENTRY_START
      || delineator.delineatorType === TimelogDelineatorType.TIMELOG_ENTRY_END) {
      this.daybookService.openTLEDelineator(delineator);
    }
  }

  public onClickSaveEdit() { this.row.updateSavedDelineator(); }
  public onClickDelete() { this.row.deleteDelineator(this.row.markedDelineator.time); }



}
