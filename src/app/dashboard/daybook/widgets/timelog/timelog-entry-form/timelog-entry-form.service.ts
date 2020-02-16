import { Injectable } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ToolboxService } from '../../../../../toolbox-menu/toolbox.service';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';
import * as moment from 'moment';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { DisplayGridBarItem } from './daybook-grid-items-bar/display-grid-bar-item.class';
import { DaybookDisplayService } from '../../../daybook-display.service';
import { DaybookController } from '../../../controller/daybook-controller.class';
import { DaybookAvailabilityType } from '../../../controller/items/daybook-availability-type.enum';

@Injectable({
  providedIn: 'root'
})
export class TimelogEntryFormService {

  constructor(private toolBoxService: ToolboxService, private daybookService: DaybookDisplayService) { }

  private _isInitiated: boolean = false;
  private _toolIsOpenSub: Subscription = new Subscription();

  private _formChanged$: BehaviorSubject<TLEFFormCase> = new BehaviorSubject(null);

  private _openedTimelogEntry: TimelogEntryItem;
  private _openedSleepEntry: SleepEntryItem;

  private _gridBarItems: DisplayGridBarItem[] = [];
  private _activeGridBarItem: DisplayGridBarItem;

  public get openedTimelogEntry(): TimelogEntryItem { return this._openedTimelogEntry; }
  public get openedSleepEntry(): SleepEntryItem { return this._openedSleepEntry; }
  public get formCase(): TLEFFormCase { return this._formChanged$.getValue(); }
  public get formChanged$(): Observable<TLEFFormCase> { return this._formChanged$.asObservable(); }
  public get toolIsOpen$(): Observable<boolean> { return this.toolBoxService.toolIsOpen$; }

  public get gridBarItems(): DisplayGridBarItem[] { return this._gridBarItems; }
  public get activeGridBarItem(): DisplayGridBarItem { return this._activeGridBarItem; }

  public openNewCurrentTimelogEntry() {
    this._initiate();
    const formCase = TLEFFormCase.NEW_CURRENT;
    this._buildGridBarItems(true);
    this._openedTimelogEntry = this.daybookService.todayController.getNewCurrentTLE();
    this._setActiveItem(this.openedTimelogEntry.startTime, this.openedTimelogEntry.endTime);
    this.toolBoxService.openTimelogEntryForm();
    this._formChanged$.next(formCase);
    this._openedSleepEntry = null;
    
  }

  public openTimelogEntry(timelogEntry: TimelogEntryItem) {
    this._initiate();
    const formCase: TLEFFormCase = this._determineCase(timelogEntry);
    this._buildGridBarItems(formCase === TLEFFormCase.NEW_CURRENT);
    this._openedTimelogEntry = timelogEntry;
    this._setActiveItem(timelogEntry.startTime, timelogEntry.endTime);
    this.toolBoxService.openTimelogEntryForm();
    this._formChanged$.next(formCase);
    this._openedSleepEntry = null;
    
  }
  public openSleepEntry(sleepEntry: SleepEntryItem) {
    this._initiate();
    const formCase = TLEFFormCase.SLEEP;
    this._buildGridBarItems();
    this._openedSleepEntry = sleepEntry;
    this._setActiveItem(sleepEntry.startTime, sleepEntry.endTime);
    this.toolBoxService.openSleepEntryForm();
    this._formChanged$.next(formCase);
    this._openedTimelogEntry = null;
    
  }


  public gridBarGoLeft(){
    const currentActiveIndex = this.gridBarItems.findIndex(item => item.isActive === true);
    let setToIndex = currentActiveIndex;
    if(currentActiveIndex > 0){
      setToIndex = currentActiveIndex-1;
    }
    const setToItem = this.gridBarItems[setToIndex];
    if(setToItem.availabilityType === DaybookAvailabilityType.SLEEP){
      this.openSleepEntry(setToItem.sleepEntry);
    }else{
      this.openTimelogEntry(setToItem.timelogEntry);
    }
  }

  public gridBarGoRight(){
    const currentActiveIndex = this.gridBarItems.findIndex(item => item.isActive === true);
    let setToIndex = currentActiveIndex;
    if(currentActiveIndex < this.gridBarItems.length-1){
      setToIndex = currentActiveIndex+1;
    }
    const setToItem = this.gridBarItems[setToIndex];
    if(setToItem.availabilityType === DaybookAvailabilityType.SLEEP){
      this.openSleepEntry(setToItem.sleepEntry);
    }else{
      this.openTimelogEntry(setToItem.timelogEntry);
    }
  }



  private _setActiveItem(itemStart: moment.Moment, itemEnd: moment.Moment){
    this.gridBarItems.forEach(item => item.isActive = false);
    const foundItem = this.gridBarItems.find((gridItem)=>{
      let itemFound: boolean = false;
      if(gridItem.startTime.isSame(itemStart) && gridItem.endTime.isSame(itemEnd)){
        itemFound = true;
      }else{
        if(gridItem.startTime.isSameOrAfter(itemStart) && gridItem.endTime.isSameOrBefore(itemEnd)){
          itemFound = true;
        }
      }
      return itemFound;
    });
    if(foundItem){
      foundItem.isActive = true;
      this._activeGridBarItem = foundItem;
    }else{
      // console.log('Error: could not find the item to activate it.  '  + itemStart.format('YYYY-MM-DD hh:mm a') + " to " + itemEnd.format('YYYY-MM-DD hh:mm a'))
      this.gridBarItems.forEach(item => item.isActive = false);
    }
  }










  private _initiate() {
    if (!this._isInitiated) {
      this._isInitiated = true;
      this._toolIsOpenSub.unsubscribe();
      this._toolIsOpenSub = this.toolBoxService.toolIsOpen$.subscribe((toolIsOpen: boolean) => {
        if (toolIsOpen === false) {
          this._closeForm();
        }
      });
    }
  }

  private _buildGridBarItems(isNewCurrent = false){
    let startTime: moment.Moment = this.daybookService.displayStartTime;
    let endTime: moment.Moment = this.daybookService.displayEndTime;
    let controller: DaybookController = this.daybookService.activeDayController;
    if(isNewCurrent){
      controller = this.daybookService.todayController;
      startTime = moment(controller.wakeupTime).subtract(15, 'minutes');
      endTime = moment(controller.fallAsleepTime).add(15, 'minutes');
    }
    let gridBarItems: DisplayGridBarItem[] = controller.fullScheduleItems
      .filter(item => {
        const startsAtStart = item.startTime.isSameOrBefore(startTime) && item.endTime.isAfter(startTime);
        const isInMiddle = item.startTime.isSameOrAfter(startTime) && item.endTime.isBefore(endTime);
        const endsAtEnd = item.startTime.isBefore(endTime) && item.endTime.isSameOrAfter(endTime); 
        return startsAtStart || isInMiddle || endsAtEnd;
      }).map((item) => {
        const gridBarItem = new DisplayGridBarItem(item);
        if(item.value === DaybookAvailabilityType.SLEEP){
          gridBarItem.sleepEntry = controller.getSleepItem(item.startTime, item.endTime)
        }else if(item.value === DaybookAvailabilityType.TIMELOG_ENTRY){
          gridBarItem.timelogEntry = controller.getTimelogEntryItem(item.startTime, item.endTime);
        }else if (item.value === DaybookAvailabilityType.AVAILABLE){
          gridBarItem.timelogEntry = new TimelogEntryItem(item.startTime, item.endTime);
        }
        return gridBarItem;
      });
    this._gridBarItems = gridBarItems;
    console.log("GRID BAR ITEMS: ")
    this._gridBarItems.forEach((item)=>{
      console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " - " + item.endTime.format('YYYY-MM-DD hh:mm a') + " : " + item.availabilityType)
    });

    
  }

  private _closeForm() {
    this._openedSleepEntry = null;
    this._openedTimelogEntry = null;
    this._formChanged$.next(null);
    this._isInitiated = false;
    this._toolIsOpenSub.unsubscribe();
  }

  private _determineCase(entry: TimelogEntryItem): TLEFFormCase {
    let formCase: TLEFFormCase;
    const startTime: moment.Moment = entry.startTime;
    const endTime: moment.Moment = entry.endTime;
    const now: moment.Moment = moment(this.daybookService.clock).startOf('minute');
    const isPrevious: boolean = endTime.isBefore(now);
    const isFuture: boolean = startTime.isAfter(now);
    if (isPrevious) {
      if (entry.isSavedEntry) { formCase = TLEFFormCase.EXISTING_PREVIOUS; }
      else { formCase = TLEFFormCase.NEW_PREVIOUS; }
    } else if (isFuture) {
      if (entry.isSavedEntry) { formCase = TLEFFormCase.EXISTING_FUTURE; }
      else { formCase = TLEFFormCase.NEW_FUTURE; }
    } else {
      if (entry.isSavedEntry) {
        formCase = TLEFFormCase.EXISTING_CURRENT;
      } else if (!entry.isSavedEntry) {
        if (now.isSame(startTime)) { formCase = TLEFFormCase.NEW_CURRENT_FUTURE; }
        else if (now.isAfter(startTime)) { formCase = TLEFFormCase.NEW_CURRENT; }
      }
    }
    console.log("CASE IS: " + formCase)
    return formCase;
  }


}
