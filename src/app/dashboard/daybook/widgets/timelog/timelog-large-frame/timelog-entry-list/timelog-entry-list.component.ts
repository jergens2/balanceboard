import { Component, OnInit } from '@angular/core';
import { DaybookControllerService } from '../../../../controller/daybook-controller.service';
import { DaybookDayItem } from '../../../../api/daybook-day-item.class';
import { TimelogEntryItem } from '../timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { DurationString } from '../../../../../../shared/utilities/time-utilities/duration-string.class';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DaybookDisplayService } from '../../../../daybook-display.service';

@Component({
  selector: 'app-timelog-entry-list',
  templateUrl: './timelog-entry-list.component.html',
  styleUrls: ['./timelog-entry-list.component.css']
})
export class TimelogEntryListComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  private _timelogEntryItems: TimelogEntryItem[] = [];
  public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; }
  public durationString(entry: TimelogEntryItem): string { 
    return DurationString.calculateDurationString(entry.startTime, entry.endTime);
  }

  public faEdit = faEdit;
  public faTrash = faTrash;

  ngOnInit() {
    // this._timelogEntryItems = this.daybookControllerService.activeDayController.timelogEntryItems;
    // this.daybookControllerService.activeDayController$.subscribe((updated)=>{
    //   this._timelogEntryItems = this.daybookControllerService.activeDayController.timelogEntryItems;
    // });
    this._update();
    this.daybookService.displayUpdated$.subscribe((change)=>{
      this._update();
    });
  }

  private _update(){
    const startOfDay = moment(this.daybookService.clock).startOf('day');
    const endOfDay = moment(startOfDay).add(24, 'hours');
    this._timelogEntryItems = this.daybookService.activeDayController.timelogEntryItems.filter((item)=>{
      return item.startTime.isSameOrAfter(startOfDay) && item.endTime.isSameOrBefore(endOfDay);
    });
  }

  public onClickEdit(entry: TimelogEntryItem){
  }
  public onClickDelete(entry: TimelogEntryItem){
    this.daybookService.activeDayController.deleteTimelogEntryItem$(entry);
  }


}
