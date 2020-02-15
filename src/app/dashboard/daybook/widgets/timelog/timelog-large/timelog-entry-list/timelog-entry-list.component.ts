import { Component, OnInit } from '@angular/core';
import { DaybookControllerService } from '../../../../controller/daybook-controller.service';
import { DaybookDayItem } from '../../../../../daybook/api/daybook-day-item.class';
import { TimelogEntryItem } from '../timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { DurationString } from '../../../../../../shared/utilities/time-utilities/duration-string.class';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-timelog-entry-list',
  templateUrl: './timelog-entry-list.component.html',
  styleUrls: ['./timelog-entry-list.component.css']
})
export class TimelogEntryListComponent implements OnInit {

  constructor(private daybookControllerService: DaybookControllerService) { }

  private _timelogEntryItems: TimelogEntryItem[] = [];
  public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; }
  public durationString(entry: TimelogEntryItem): string { 
    return DurationString.calculateDurationString(entry.startTime, entry.endTime);
  }

  public faEdit = faEdit;
  public faTrash = faTrash;

  ngOnInit() {
    this._timelogEntryItems = this.daybookControllerService.activeDayController.timelogEntryItems;
    this.daybookControllerService.activeDayController$.subscribe((updated)=>{
      this._timelogEntryItems = this.daybookControllerService.activeDayController.timelogEntryItems;
    });

  }

  public onClickEdit(entry: TimelogEntryItem){
  }
  public onClickDelete(entry: TimelogEntryItem){
    this.daybookControllerService.activeDayController.deleteTimelogEntryItem$(entry);
  }


}
