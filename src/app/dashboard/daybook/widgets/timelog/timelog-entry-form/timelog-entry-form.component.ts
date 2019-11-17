import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFActivityListItem } from './tlef-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';
import { ToolsService } from '../../../../../tools-menu/tools/tools.service';
import { DaybookService } from '../../../daybook.service';
import * as moment from 'moment';
import { ItemState } from '../../../../../shared/utilities/item-state.class';
import { TimelogEntryActivity } from '../../../api/data-items/timelog-entry-activity.interface';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookDayItemSleepProfileData } from '../../../api/data-items/daybook-day-item-sleep-profile-data.interface';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit {

  constructor(private toolsService: ToolsService, private daybookService: DaybookService) { }

  private _itemState: ItemState;
  private _modifyingTimes = false;
  private _mode: 'EDIT' | 'NEW' = 'NEW';

  private _entryItem: TimelogEntryItem = null;
  private _activityItems: TimelogEntryActivity[] = [];

  private _dataEntryItem: DaybookTimelogEntryDataItem;
  private _startTimeBoundary: moment.Moment;
  private _endTimeBoundary: moment.Moment;
  private _wakeupTimeIsSet = false;
  private _activeDayIsToday = false;
  private _promptForWakeupTime = false;

  private _template: {
    startTime: moment.Moment,
    startTimeStartBoundary: moment.Moment,
    startTimeEndBoundary: moment.Moment,
    setSleepProfileRequired: boolean,
    crossesMidnight: boolean,
    isAmbiguous: boolean,
  };

  private _confirmDelete = false;
  private _confirmDiscard = false;
  faEdit = faEdit;


  private setEntryItem(entryItem: TimelogEntryItem) {
    console.log('Setting entry item: ', entryItem);
    this._entryItem = new TimelogEntryItem(entryItem.startTime, entryItem.endTime, entryItem.sleepState);
    this._entryItem.isSavedEntry = entryItem.isSavedEntry;
    this._entryItem.timelogEntryActivities = entryItem.timelogEntryActivities;
    this._dataEntryItem = this._entryItem.dataEntryItem;
    this._activityItems = [];
    this._entryItem.timelogEntryActivities.forEach((item) => {
      this._activityItems.push(item);
    });
  }

  ngOnInit() {
    this._activeDayIsToday = this.daybookService.activeDay.isToday;
    this._wakeupTimeIsSet = this.daybookService.activeDay.sleepProfile.wakeupTimeIsSet;
    if (!this._wakeupTimeIsSet && this._activeDayIsToday) { this._promptForWakeupTime = true; }
    const receivedEntry = this.toolsService.receiveTimelogEntry();
    if (!receivedEntry) {
      console.log('new')
      this._mode = 'NEW';
      this.buildNewEntryItem();
    } else {
      if (receivedEntry.isSavedEntry) {
        this._mode = 'EDIT';
        this.setEntryItem(receivedEntry);
      } else {
        this._mode = 'NEW';
        this.buildNewEntryItem(receivedEntry);
      }
    }


    // console.log("Entry item: ", this.entryItem.startTime.format("hh:mm a") + " -- - -- " + this.entryItem.endTime.format("hh:mm a"));
  }


  private buildNewEntryItem(receivedEntry?: TimelogEntryItem) {
    let startTime: moment.Moment;
    let endTime: moment.Moment;
    if (receivedEntry) {
      startTime = receivedEntry.startTime;
      endTime = receivedEntry.endTime;
    } else {
      this._template = this.daybookService.activeDay.timeReferencer.getNewTimelogEntryTemplate();
      if (this._template) {
        startTime = this._template.startTime;
        endTime = moment();
      } else {
        console.log('Error:  no template');
      }
    }
    const timelogEntry: TimelogEntryItem = new TimelogEntryItem(startTime, endTime);
    this.setEntryItem(timelogEntry);
  }


  public get entryItem(): TimelogEntryItem { return this._entryItem; }
  public get dataEntryItem(): DaybookTimelogEntryDataItem { return this._dataEntryItem; }
  public get startTimeBoundary(): moment.Moment { return this._startTimeBoundary; }
  public get endTimeBoundary(): moment.Moment { return this._endTimeBoundary; }
  public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }
  public get isChanged(): boolean { return true; }
  public get mode(): 'EDIT' | 'NEW' { return this._mode; }
  public get modifyingTimes(): boolean { return this._modifyingTimes; }
  public get promptForWakeupTime(): boolean { return this._promptForWakeupTime; }

  public onWakeupTimeChanged(wakeupTime: moment.Moment) {
    console.log('wakeup time changed: ', wakeupTime.format('hh:mm a'));
    this.daybookService.activeDay.sleepProfile.setWakeupTime(wakeupTime);
    this.daybookService.activeDay.sleepProfile.saveChanges();
    this.buildNewEntryItem();
  }


  public onClickModifyTimes() { this._modifyingTimes = true; }

  public onTimesModified(times: { startTime: moment.Moment, endTime: moment.Moment }) {
    // console.log("times: ", times);
    this._modifyingTimes = false;
  }

  onActivitiesChanged(items: TLEFActivityListItem[]) {
    this._activityItems = items.map((item) => {
      return {
        percentage: item.durationPercent,
        activityTreeId: item.activity.treeId,
      };
    });
    // let checkEntries: TimelogEntryActivity[] = []
    // this._entryItem.timelogEntryActivities.forEach((item) => {
    //   checkEntries.push(item);
    // })
    // console.log("onactivitieschanged", this._activityItems);
    // this._itemState.checkIfChanged(checkEntries);
  }

  onClickSave() {
    // console.log("Saving timelog entry: ", this.entryItem);
    this._entryItem.timelogEntryActivities = this._activityItems;
    if (this.mode === 'NEW') {
      this.daybookService.activeDay.saveTimelogEntry(this.entryItem);
      // console.log("Saving new on the TODAY item")

      // if (this._activeDayIsToday) {
        

      //   if (this.entryCrossesMidnight(this.entryItem)) {
      //     const splitEntry: { first: TimelogEntryItem, second: TimelogEntryItem } = this.splitTimelogEntryOverMidnight(this.entryItem);
      //     this.daybookService.activeDay.saveTimelogEntry(splitEntry.first, splitEntry.second);
      //   } else {
      //     // console.log("Saving timelog entry item", this.entryItem.startTime.format('hh:mm a')
      //     // + " to " + this.entryItem.endTime.format('hh:mm a'))
      //     this.daybookService.activeDay.saveTimelogEntry(this.entryItem);
      //   }
      // } else {
      //   this.daybookService.activeDay.saveTimelogEntry(this.entryItem);
      // }
    } else if (this.mode === 'EDIT') {
      console.log(" UPDATING OLD on the ACTIVEDAY item")
      this.daybookService.activeDay.updateTimelogEntry(this.entryItem);
    }
    this.toolsService.closeTool();
  }

  private entryCrossesMidnight(entryItem: TimelogEntryItem): boolean {
    let isAfterMidnight = false;
    if (entryItem.endTime.isAfter(moment(entryItem.startTime).endOf('day'))) {
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
    first.endTime = first.startTime.endOf('day');
    second = Object.assign({}, entry);
    second.startTime = second.endTime.startOf('day');
    // }else{

    // }

    splitEntry = { first: first, second: second };
    return splitEntry;
  }

  public get confirmDelete(): boolean { return this._confirmDelete; }
  public get confirmDiscard(): boolean { return this._confirmDiscard; }

  onClickDelete() {
    if (this.confirmDelete === false) {
      this._confirmDelete = true;
    } else {
      this.daybookService.activeDay.deleteTimelogEntry(this.entryItem);
      this.toolsService.closeTool();
    }
  }

  onClickDiscard() {
    this.toolsService.closeTool();
  }


}
