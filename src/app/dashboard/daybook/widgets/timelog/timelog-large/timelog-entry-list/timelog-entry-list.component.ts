import { Component, OnInit } from '@angular/core';
import { DaybookService } from '../../../../../daybook/daybook.service';
import { DaybookDayItem } from '../../../../../daybook/api/daybook-day-item.class';
import { TimelogEntryItem } from '../timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';

@Component({
  selector: 'app-timelog-entry-list',
  templateUrl: './timelog-entry-list.component.html',
  styleUrls: ['./timelog-entry-list.component.css']
})
export class TimelogEntryListComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private _timelogEntryItems: TimelogEntryItem[] = [];
  public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; }

  ngOnInit() {
    this._timelogEntryItems = this.daybookService.activeDayController.timelogEntryController.timelogEntryItems;
    this.daybookService.activeDayController$.subscribe((updated)=>{
      this._timelogEntryItems = this.daybookService.activeDayController.timelogEntryController.timelogEntryItems;
    });

  }


}
