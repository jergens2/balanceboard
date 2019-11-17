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
import { LoggingService } from '../../../../../shared/logging/logging.service';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit {

  constructor(private toolsService: ToolsService, private daybookService: DaybookService, private loggingService: LoggingService) { }

  private _modifyingTimes = false;
  private _formCase: 'NEW_CURRENT' | 'NEW_PREVIOUS' | 'NEW_FUTURE' | 'EXISTING_PREVIOUS' | 'EXISTING_FUTURE';

  private _entryItem: TimelogEntryItem = null;
  private _activityItems: TimelogEntryActivity[] = [];

  private _dataEntryItem: DaybookTimelogEntryDataItem;
  private _startTimeBoundary: moment.Moment;
  private _endTimeBoundary: moment.Moment;
  private _promptForWakeupTime = false;

  private _confirmDelete = false;
  private _confirmDiscard = false;
  faEdit = faEdit;


  ngOnInit() {
    const receivedEntry = this.toolsService.timelogEntryStorage;
    this._determineCase(receivedEntry);
    this.toolsService.timelogEntryStorage$.subscribe((newValue: TimelogEntryItem) => {
      if (newValue !== null) {
        console.log('WE dun got ourselves a new value: ' + newValue.startTime.format('YYYY-MM-DD hh:mm a'));
        this._determineCase(newValue);
      }
    });
  }





  private _determineCase(receivedEntry: TimelogEntryItem) {
    if (!receivedEntry) {
      /*  In this case, the user opened the form from the Tool menu */
      this._setFormCase('NEW_CURRENT');
    } else {
      const isPrevious: boolean = receivedEntry.startTime.isBefore(moment()) && receivedEntry.endTime.isBefore(moment());
      const isFuture: boolean = receivedEntry.startTime.isAfter(moment()) && receivedEntry.endTime.isAfter(moment());
      if (receivedEntry.isCurrentEntry) {
        /* In this case, the user clicked on the current Timelog Entry in the Daybook */
        this._setFormCase('NEW_CURRENT', receivedEntry);
      } else if (receivedEntry.isSavedEntry) {
        if (isPrevious) {
          this._setFormCase('EXISTING_PREVIOUS', receivedEntry);
        } else if (isFuture) {
          this._setFormCase('EXISTING_FUTURE', receivedEntry);
        }
      } else {
        if (isPrevious) {
          this._setFormCase('NEW_PREVIOUS', receivedEntry);
        } else if (isFuture) {
          this._setFormCase('NEW_FUTURE', receivedEntry);
        }
      }
    }
  }

  private _setFormCase(
    tlefCase: 'NEW_CURRENT' | 'NEW_PREVIOUS' | 'NEW_FUTURE' | 'EXISTING_PREVIOUS' | 'EXISTING_FUTURE', receivedEntry?: TimelogEntryItem) {
    console.log('Form case is : ' + tlefCase);
    let entryItem: TimelogEntryItem;
    if (tlefCase === 'NEW_CURRENT') {
      if (!this.wakeupTimeIsSet) {
        this._promptForWakeupTime = true;
      }
      if (receivedEntry) {
        entryItem = receivedEntry;
      } else {
        const template = this.daybookService.today.timeReferencer.getNewTimelogEntryTemplate();
        if (template.crossesMidnight) {
          console.log('Template says that we crossed midnight');
        }
        entryItem = new TimelogEntryItem(template.startTime, moment());
      }
    } else if (tlefCase === 'NEW_PREVIOUS' || tlefCase === 'NEW_FUTURE') {
      if (!receivedEntry) {
        console.log('No receivedEntry in method');
        this.loggingService.logNewError('No receivedEntry in method')
      } else {
        entryItem = receivedEntry;
      }
    } else if (tlefCase === 'EXISTING_PREVIOUS' || tlefCase === 'EXISTING_FUTURE') {
      if (!receivedEntry) {
        console.log('No receivedEntry in method');
        this.loggingService.logNewError('No receivedEntry in method')
      } else {
        entryItem = receivedEntry;
      }
    }
    this._formCase = tlefCase;
    this.setEntryItem(entryItem);
  }




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


  public get entryItem(): TimelogEntryItem { return this._entryItem; }
  public get dataEntryItem(): DaybookTimelogEntryDataItem { return this._dataEntryItem; }
  public get startTimeBoundary(): moment.Moment { return this._startTimeBoundary; }
  public get endTimeBoundary(): moment.Moment { return this._endTimeBoundary; }
  public get wakeupTimeIsSet(): boolean { return this.daybookService.today.sleepProfile.wakeupTimeIsSet; }
  public get formCase(): 'NEW_CURRENT' | 'NEW_PREVIOUS' | 'NEW_FUTURE' | 'EXISTING_PREVIOUS' | 'EXISTING_FUTURE' { return this._formCase; }
  public get modifyingTimes(): boolean { return this._modifyingTimes; }
  public get promptForWakeupTime(): boolean { return this._promptForWakeupTime; }
  public get activeDayIsToday(): boolean { return this.daybookService.activeDay.isToday; }

  public onWakeupTimeChanged(wakeupTime: moment.Moment) {
    console.log('wakeup time changed: ', wakeupTime.format('hh:mm a'));
    this.daybookService.activeDay.sleepProfile.setWakeupTime(wakeupTime);
    this.daybookService.activeDay.sleepProfile.saveChanges();
    if (!this.wakeupTimeIsSet) {
      this._promptForWakeupTime = true;
    } else {
      this._promptForWakeupTime = false;
    }
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
    if (this.formCase === 'NEW_CURRENT') {
      console.log('Saving current TLEF to Today item');
      this.daybookService.today.saveTimelogEntry(this.entryItem);
    } else if (this.formCase === 'NEW_FUTURE' || this.formCase === 'NEW_PREVIOUS') {
      console.log('Saving new TLEF to Active Day Item');
      this.daybookService.activeDay.saveTimelogEntry(this.entryItem);
    } else if (this.formCase === 'EXISTING_PREVIOUS' || this.formCase === 'EXISTING_FUTURE') {
      console.log('Updating existing entry to Active Day item');
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
