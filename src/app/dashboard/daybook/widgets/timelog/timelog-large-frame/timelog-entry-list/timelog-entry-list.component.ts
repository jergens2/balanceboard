import { Component, OnInit } from '@angular/core';
import { DaybookDayItem } from '../../../../daybook-day-item/daybook-day-item.class';
import { TimelogEntryItem } from '../timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { DurationString } from '../../../../../../shared/time-utilities/duration-string.class';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DaybookDisplayService } from '../../../../daybook-display.service';
import { TimelogEntryActivity } from '../../../../daybook-day-item/data-items/timelog-entry-activity.interface';
import { ActivityCategoryDefinition } from '../../../../../activities/api/activity-category-definition.class';
import { ActivityHttpService } from '../../../../../activities/api/activity-http.service';



@Component({
  selector: 'app-timelog-entry-list',
  templateUrl: './timelog-entry-list.component.html',
  styleUrls: ['./timelog-entry-list.component.css']
})
export class TimelogEntryListComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService, private activityService: ActivityHttpService) { }

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
    // this.daybookService.displayUpdated$.subscribe((change)=>{
    //   this._update();
    // });
  }

  private _update(){
    this._timelogEntryItems = this.daybookService.daybookController.tleController.timelogEntryItems.filter((item)=>{
      return item.startTime.isSameOrAfter(this.daybookService.displayStartTime) && item.endTime.isSameOrBefore(this.daybookService.displayEndTime);
    });
  }

  public onClickEdit(entry: TimelogEntryItem){
  }
  public onClickDelete(entry: TimelogEntryItem){
    this.daybookService.daybookController.tleController.deleteTimelogEntryItem(entry.startTime.format('YYYY-MM-DD'), entry);
  }


  public getActivity(activity: TimelogEntryActivity): ActivityCategoryDefinition{
    return this.activityService.findActivityByTreeId(activity.activityTreeId);
  }

}
