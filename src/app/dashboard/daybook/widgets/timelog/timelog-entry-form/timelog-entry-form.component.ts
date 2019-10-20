import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFActivityListItem } from './tlef-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';
import { ToolsService } from '../../../../../tools-menu/tools/tools.service';
import { DaybookService } from '../../../daybook.service';
import * as moment from 'moment';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit {

  constructor(private toolsService: ToolsService, private daybookService: DaybookService) { }

  @Input() entryItem: TimelogEntryItem;

  // private _saveTimelogEntry: 

  ngOnInit() {
    console.log("Entry item: ", this.entryItem.startTime.format("hh:mm a") + " -- - -- " + this.entryItem.endTime.format("hh:mm a"));
  }

  onActivitiesChanged(items: TLEFActivityListItem[]) {
    this.entryItem.timelogEntryActivities = items.map((item) => {
      return {
        percentage: item.durationPercent,
        activityTreeId: item.activity.treeId,
      }
    });
  }

  onClickSave() {
    console.log("Saving timelog entry: ", this.entryItem);


    if (this.entryCrossesMidnight(this.entryItem)) {
      let splitEntry: { first: TimelogEntryItem, second: TimelogEntryItem } = this.splitTimelogEntryOverMidnight(this.entryItem);
      this.daybookService.saveTimelogEntry(splitEntry.first, splitEntry.second);
    } else {
      console.log("Saving timelog entry item", this.entryItem.startTime.format('hh:mm a') + " to " + this.entryItem.endTime.format('hh:mm a'))
      this.daybookService.saveTimelogEntry(this.entryItem);
    }


    this.toolsService.closeTool();
  }

  private entryCrossesMidnight(entryItem: TimelogEntryItem): boolean {
    let isAfterMidnight: boolean = false;
    if(entryItem.endTime.isAfter(moment(entryItem.startTime).endOf("day"))){
      isAfterMidnight = true;
    }
    console.log("crosses midngiht: ? " , isAfterMidnight)
    return isAfterMidnight;
  }

  private splitTimelogEntryOverMidnight(entry: TimelogEntryItem): { first: TimelogEntryItem, second: TimelogEntryItem } {
    let splitEntry: { first: TimelogEntryItem, second: TimelogEntryItem };
    let first: TimelogEntryItem;
    let second: TimelogEntryItem;
    // if(entry.timelogEntryActivities.length <= 1){
    first = Object.assign({}, entry);
    first.endTime = first.startTime.endOf("day");
    second = Object.assign({}, entry);
    second.startTime = second.endTime.startOf("day");
    // }else{

    // }

    splitEntry = { first: first, second: second };
    return splitEntry;
  }

  onClickDiscard() {
    this.toolsService.closeTool();
  }

}
