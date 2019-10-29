import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFActivityListItem } from './tlef-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';
import { ToolsService } from '../../../../../tools-menu/tools/tools.service';
import { DaybookService } from '../../../daybook.service';
import * as moment from 'moment';
import { ItemState } from '../../../../../shared/utilities/item-state.class';
import { TimelogEntryActivity } from '../../../api/data-items/timelog-entry-activity.interface';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookDayItemSleepProfile } from '../../../api/data-items/daybook-day-item-sleep-profile.interface';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit {

  constructor(private toolsService: ToolsService, private daybookService: DaybookService) { }


  private _entryItem: TimelogEntryItem;
  private _activityItems: TimelogEntryActivity[] = [];

  @Input() public set entryItem(entryItem: TimelogEntryItem){
    if(entryItem){
      this._entryItem = new TimelogEntryItem(entryItem.startTime, entryItem.endTime, entryItem.sleepState);
      this._entryItem.isSavedEntry = entryItem.isSavedEntry;
      this._entryItem.timelogEntryActivities = entryItem.timelogEntryActivities;
      this._activityItems = [];
      this._dataEntryItem = this._entryItem.dataEntryItem;
      this._entryItem.timelogEntryActivities.forEach((item)=>{
        this._activityItems.push(item);
      });
      this.reload();
    }
  }

  private _dataEntryItem: DaybookTimelogEntryDataItem;
  public get entryItem(): TimelogEntryItem{ return this._entryItem; };
  public get dataEntryItem(): DaybookTimelogEntryDataItem { return this._dataEntryItem; };

  // private _saveTimelogEntry: 

  ngOnInit() {
    // console.log("Entry item: ", this.entryItem.startTime.format("hh:mm a") + " -- - -- " + this.entryItem.endTime.format("hh:mm a"));
    if(!this._entryItem){
      const wakeupTimeIsSet: boolean = this.daybookService.today.sleepProfile.wakeupTimeISO != "" && this.daybookService.today.sleepProfile.wakeupTimeISO != null;
      if(!wakeupTimeIsSet && !this.daybookService.isAwakeAfterMidnight){
        console.log("no wakeup time;")
        this._wakeupTimeIsSet = false;
      }
      this.entryItem = this.daybookService.getNewTimelogEntry();
    }
  }

  private _wakeupTimeIsSet: boolean = true;
  public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }; 

  public onWakeupTimeChanged(wakeupTime: moment.Moment){
    console.log("wakeup time changed: ", wakeupTime.format("hh:mm a"));
    let sleepProfile: DaybookDayItemSleepProfile = this.daybookService.activeDay.sleepProfile;
    sleepProfile.wakeupTimeISO = wakeupTime.toISOString();
    sleepProfile.wakeupTimeUtcOffsetMinutes = wakeupTime.utcOffset();
    this.daybookService.activeDay.sleepProfile = sleepProfile;
    this._wakeupTimeIsSet = true;
  }

  private reload(){
    this._mode = this.entryItem.isSavedEntry ? "EDIT" : "NEW";

    this._itemState = new ItemState(this.entryItem.timelogEntryActivities);
  }


  private _itemState: ItemState;
  public get isChanged(): boolean { return true; }

  private _mode: "EDIT" | "NEW" = "NEW";
  public get mode(): "EDIT" | "NEW" { return this._mode; };

  onActivitiesChanged(items: TLEFActivityListItem[]) {
    this._activityItems = items.map((item) => {
      return {
        percentage: item.durationPercent,
        activityTreeId: item.activity.treeId,
      }
    });
    // let checkEntries: TimelogEntryActivity[] = []
    // this._entryItem.timelogEntryActivities.forEach((item) => {
    //   checkEntries.push(item);
    // })
    console.log("onactivitieschanged", this._activityItems);
    // this._itemState.checkIfChanged(checkEntries);
  }

  onClickSave() {
    // console.log("Saving timelog entry: ", this.entryItem);

    this._entryItem.timelogEntryActivities = this._activityItems;

    if (this.mode === "NEW") {
      if (this.entryCrossesMidnight(this.entryItem)) {
        let splitEntry: { first: TimelogEntryItem, second: TimelogEntryItem } = this.splitTimelogEntryOverMidnight(this.entryItem);
        this.daybookService.saveTimelogEntry(splitEntry.first, splitEntry.second);
      } else {
        // console.log("Saving timelog entry item", this.entryItem.startTime.format('hh:mm a') + " to " + this.entryItem.endTime.format('hh:mm a'))
        this.daybookService.saveTimelogEntry(this.entryItem);
      }

    } else if (this.mode === "EDIT") {
      this.daybookService.updateTimelogEntry(this.entryItem);
    }



    this.toolsService.closeTool();
  }

  private entryCrossesMidnight(entryItem: TimelogEntryItem): boolean {
    let isAfterMidnight: boolean = false;
    if (entryItem.endTime.isAfter(moment(entryItem.startTime).endOf("day"))) {
      isAfterMidnight = true;
    }
    // console.log("crosses midngiht: ? " , isAfterMidnight)
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


  private _confirmDelete: boolean = false;
  private _confirmDiscard: boolean = false;
  public get confirmDelete(): boolean { return this._confirmDelete; };
  public get confirmDiscard(): boolean { return this._confirmDiscard; };

  onClickDelete() {
    if(this.confirmDelete === false){
      this._confirmDelete = true;
    }else{
      this.daybookService.deleteTimelogEntry(this.entryItem);
      this.toolsService.closeTool();
    }
  }


  onClickDiscard() {
    if (!this.isChanged) {
      this._entryItem = this._itemState.cancelAndReturnOriginalValue();
      this.toolsService.closeTool();
    } else {
      if (this.confirmDiscard === false) {
        this._confirmDiscard = true;
      } else {
        this._entryItem = this._itemState.cancelAndReturnOriginalValue();
        this.toolsService.closeTool();
      }
    }
    
  }
}
