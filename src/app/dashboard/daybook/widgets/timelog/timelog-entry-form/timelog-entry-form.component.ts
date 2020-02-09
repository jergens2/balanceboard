import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFActivityListItem } from './tlef-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';
import { ToolsService } from '../../../../../tools-menu/tools/tools.service';
import { DaybookService } from '../../../daybook.service';
import * as moment from 'moment';
import { ItemState } from '../../../../../shared/utilities/item-state.class';
import { TimelogEntryActivity } from '../../../api/data-items/timelog-entry-activity.interface';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { faEdit, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { LoggingService } from '../../../../../shared/logging/logging.service';
import { TLEFFormCase } from './tlef-form-case.enum';
import { DaybookTimelogEntryTemplate } from '../../../controller/items/daybook-timelog-entry-template.interface';
import { TimeUtilities } from '../../../../../shared/utilities/time-utilities/time-utilities';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit {

  constructor(private toolsService: ToolsService, private daybookService: DaybookService, private loggingService: LoggingService) { }

  private _formCase: TLEFFormCase;
  private _entryItem: TimelogEntryItem;

  ngOnInit() {
    this._entryItem = this.toolsService.timelogEntryStorage;
    this._determineCase();
    if (!this._entryItem) {
      console.log("Error: not timelog entry item");
    }
    this.toolsService.timelogEntryStorage$.subscribe((newTLE) => {
      if (newTLE) {
        this._entryItem = newTLE;
        this._determineCase();
      }
    });

  }

  public get entryItem(): TimelogEntryItem {
    return this._entryItem;
  }

  public get formCase(): TLEFFormCase {
    return this._formCase;
  }


  private _determineCase() {
    console.log("Determining the form case for timelog entry:")
    const startTime: moment.Moment = this.entryItem.startTime;
    const endTime: moment.Moment = this.entryItem.endTime;
    const now: moment.Moment =  moment(this.daybookService.clock).startOf('minute');
    console.log("   Start time: " + startTime.format('hh:mm:ss a'))
    console.log("   End time  : " + endTime.format('hh:mm:ss a'))
    console.log("   NOW:      : " + now.format('hh:mm:ss a'))

    const isPrevious: boolean = endTime.isBefore(now);
    const isFuture: boolean = startTime.isAfter(now);
    if(isPrevious){
      console.log("   Previous entry: end time was before now")
      if(this.entryItem.isSavedEntry){
        this._formCase = TLEFFormCase.EXISTING_PREVIOUS;
      }else{
        this._formCase = TLEFFormCase.NEW_PREVIOUS;
      }
    }else if(isFuture){
      console.log("   Future entry: start time was after now")
      if(this.entryItem.isSavedEntry){
        this._formCase = TLEFFormCase.EXISTING_FUTURE;
      }else{
        this._formCase = TLEFFormCase.NEW_FUTURE;
      }
    }else{
      console.log("   NEITHER future nor previous, so therefore current.")
      if(now.isSame(startTime)){
        this._formCase = TLEFFormCase.NEW_FUTURE;
      }else{
        this._formCase = TLEFFormCase.NEW_CURRENT;
      }
      
    }

  }

  // private _setFormCase(tlefCase: TLEFFormCase, receivedEntry?: TimelogEntryItem) {
  //   let entryItem: TimelogEntryItem;
  //   if (tlefCase === 'NEW_CURRENT') {
  //     if (receivedEntry) {
  //       entryItem = receivedEntry;
  //     } else {
  //       const template: DaybookTimelogEntryTemplate = this.daybookService.todayController.getNewCurrentTLETemplate();
  //       entryItem = template.timelogEntry;
  //       this._isStartOfCurrentDay = template.isFirstOfDay;
  //       this._isEndOfCurrentDay = template.isLastOfDay;
  //     }
  //   } else if (tlefCase === 'NEW_PREVIOUS' || tlefCase === 'NEW_FUTURE') {
  //     if (!receivedEntry) {
  //       console.log('Error?: No receivedEntry in method');
  //       this.loggingService.logNewError('No receivedEntry in method')
  //     } else {
  //       entryItem = receivedEntry;
  //     }
  //   } else if (tlefCase === 'EXISTING_PREVIOUS' || tlefCase === 'EXISTING_FUTURE') {
  //     if (!receivedEntry) {
  //       console.log('Error?: No receivedEntry in method');
  //       this.loggingService.logNewError('No receivedEntry in method')
  //     } else {
  //       entryItem = receivedEntry;
  //     }
  //   }
  //   this._formCase = tlefCase;
  //   this.setEntryItem(entryItem);
  // }




  // private setEntryItem(entryItem: TimelogEntryItem) {
  //   this._entryItem = new TimelogEntryItem(entryItem.startTime, entryItem.endTime);
  //   this._entryItem.isSavedEntry = entryItem.isSavedEntry;
  //   this._entryItem.timelogEntryActivities = entryItem.timelogEntryActivities;
  //   this._dataEntryItem = this._entryItem.dataEntryItem;
  //   this._activityItems = [];
  //   this._entryItem.timelogEntryActivities.forEach((item) => {
  //     this._activityItems.push(item);
  //   });
  // }








  // private _modifyingTimes = false;
  // private _editingExisting = false;

  // private _formCase: TLEFFormCase = TLEFFormCase.NEW_CURRENT;


  // private _entryItem: TimelogEntryItem = null;
  // private _activityItems: TimelogEntryActivity[] = [];

  // private _dataEntryItem: DaybookTimelogEntryDataItem;
  // private _startTimeBoundary: moment.Moment;
  // private _endTimeBoundary: moment.Moment;
  // private _isStartOfCurrentDay = false;
  // private _isEndOfCurrentDay = false;

  // private _confirmDelete = false;
  // private _confirmDiscard = false;


  // faEdit = faEdit;





  // public get entryItem(): TimelogEntryItem { return this._entryItem; }
  // public get dataEntryItem(): DaybookTimelogEntryDataItem { return this._dataEntryItem; }
  // public get startTimeBoundary(): moment.Moment { return this._startTimeBoundary; }
  // public get endTimeBoundary(): moment.Moment { return this._endTimeBoundary; }
  // public get wakeupTimeIsSet(): boolean { return this.daybookService.todayController.wakeupTimeIsSet; }

  // public get formCase(): TLEFFormCase { return this._formCase; }
  // public get isNewTLEF(): boolean {
  //   return this.formCase === TLEFFormCase.NEW_CURRENT || this.formCase === TLEFFormCase.NEW_FUTURE
  //     || this.formCase === TLEFFormCase.NEW_PREVIOUS;
  // }
  // public get isExistingTLEF(): boolean { return !this.isNewTLEF; }
  // public get isCurrentTLEF(): boolean { return this.formCase === TLEFFormCase.NEW_CURRENT; }
  // public get isPreviousTLEF(): boolean { return this.formCase === TLEFFormCase.NEW_PREVIOUS || this.formCase === TLEFFormCase.EXISTING_PREVIOUS; }
  // public get isFutureTLEF(): boolean { return this.formCase === TLEFFormCase.NEW_FUTURE || this.formCase === TLEFFormCase.EXISTING_FUTURE; }
  // public get editingExistingTLEF(): boolean { return this._editingExisting; }

  // public get isStartOfCurrentDay(): boolean { return this._isStartOfCurrentDay; }
  // public get isEndOfCurrentDay(): boolean { return this._isEndOfCurrentDay; }

  // public get modifyingTimes(): boolean { return this._modifyingTimes; }

  // public get entryItemDate(): string {
  //   if(this.entryItem.startTime.format('YYYY-MM-DD') === this.entryItem.endTime.format('YYYY-MM-DD')){
  //     return this.entryItem.startTime.format('YYYY-MM-DD');
  //   }else if (this.entryItem.endTime.diff(this.entryItem.startTime, 'days') === 1){
  //     return this.entryItem.startTime.format('YYYY-MM-DD') + " & " + this.entryItem.endTime.format('YYYY-MM-DD');
  //   }else{
  //     // ?
  //     return this.entryItem.endTime.format('YYYY-MM-DD')
  //   }
  // }

  // ngOnInit() {
  // const receivedEntry = this.toolsService.timelogEntryStorage;
  // this._determineCase(receivedEntry);
  // let storageChangeCount = 0, controllerChangeCount = 0;
  // this.toolsService.timelogEntryStorage$.subscribe((newValue: TimelogEntryItem) => {
  //   if (newValue !== null) {
  //       this._determineCase(newValue);
  //   }
  // });
  // this.daybookService.activeDayController$.subscribe((changedController) => {
  //   if(controllerChangeCount > 0){
  //     // console.log("New TLEF form: active day changed.")
  //     this._determineCase();
  //   }
  //   controllerChangeCount ++; 
  // });
  // }









  // public onClickModifyTimes() { this._modifyingTimes = true; }

  // public onClickEditTLEF() {
  //   console.log("Clicked on edit TLEF");
  //   this._editingExisting = true;
  // }

  // public onTimesModified(times: { startTime: moment.Moment, endTime: moment.Moment }) {
  //   // console.log("times: ", times);
  //   this._modifyingTimes = false;
  // }

  // onActivitiesChanged(items: TLEFActivityListItem[]) {
  //   this._activityItems = items.map((item) => {
  //     return {
  //       percentage: item.durationPercent,
  //       activityTreeId: item.activity.treeId,
  //     };
  //   });
  //   // let checkEntries: TimelogEntryActivity[] = []
  //   // this._entryItem.timelogEntryActivities.forEach((item) => {
  //   //   checkEntries.push(item);
  //   // })
  //   // console.log("onactivitieschanged", this._activityItems);
  //   // this._itemState.checkIfChanged(checkEntries);
  // }

  // onClickSave() {

  //   this._entryItem.timelogEntryActivities = this._activityItems;
  //   if (this.formCase === 'NEW_CURRENT') {
  //     console.log(' $$$ Saving current TLEF to Today item');
  //     this.daybookService.todayController.saveTimelogEntryItem$(this.entryItem);
  //   } else if (this.formCase === 'NEW_FUTURE' || this.formCase === 'NEW_PREVIOUS') {
  //     console.log(' $$$ Saving new TLEF to Active Day Item');
  //     this.daybookService.activeDayController.saveTimelogEntryItem$(this.entryItem);
  //   } else if (this.formCase === 'EXISTING_PREVIOUS' || this.formCase === 'EXISTING_FUTURE') {
  //     console.log(' $$$ Updating existing entry to Active Day item');
  //     this.daybookService.activeDayController.updateTimelogEntryItem$(this.entryItem);
  //   }
  //   this.toolsService.closeTool();
  // }

  // private entryCrossesMidnight(entryItem: TimelogEntryItem): boolean {
  //   let isAfterMidnight = false;
  //   if (entryItem.endTime.isAfter(moment(entryItem.startTime).endOf('day'))) {
  //     isAfterMidnight = true;
  //   }
  //   // console.log("crosses midngiht: ? " , isAfterMidnight)
  //   return isAfterMidnight;
  // }

  // private splitTimelogEntryOverMidnight(entry: TimelogEntryItem): { first: TimelogEntryItem, second: TimelogEntryItem } {
  //   let splitEntry: { first: TimelogEntryItem, second: TimelogEntryItem };
  //   let first: TimelogEntryItem;
  //   let second: TimelogEntryItem;
  //   // if(entry.timelogEntryActivities.length <= 1){
  //   first = Object.assign({}, entry);
  //   first.endTime = first.startTime.endOf('day');
  //   second = Object.assign({}, entry);
  //   second.startTime = second.endTime.startOf('day');
  //   // }else{

  //   // }

  //   splitEntry = { first: first, second: second };
  //   return splitEntry;
  // }

  // public get confirmDelete(): boolean { return this._confirmDelete; }
  // public get confirmDiscard(): boolean { return this._confirmDiscard; }

  // onClickDelete() {
  //   if (this.confirmDelete === false) {
  //     this._confirmDelete = true;
  //   } else {
  //     this.daybookService.activeDayController.deleteTimelogEntryItem$(this.entryItem);
  //     console.log('Deleting item without subscribing tor response');
  //     this.toolsService.closeTool();
  //   }
  // }

  // onClickDiscard() {
  //   this.toolsService.closeTool();
  // }


}
