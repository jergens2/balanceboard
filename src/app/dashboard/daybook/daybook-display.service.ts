import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimelogZoomControllerItem } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-controller-item.class';
import { DaybookControllerService } from './controller/daybook-controller.service';
import { DaybookController } from './controller/daybook-controller.class';
import { DaybookWidgetType } from './widgets/daybook-widget.class';
import { TimelogZoomType } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-type.enum';
import * as moment from 'moment';
import { DaybookAvailabilityType } from './controller/items/daybook-availability-type.enum';
import { TimeUtilities } from '../../shared/utilities/time-utilities/time-utilities';
import { TimelogDisplayGrid } from './widgets/timelog/timelog-display-grid-class';
import { TimelogDelineator, TimelogDelineatorType } from './widgets/timelog/timelog-delineator.class';
import { DisplayGridBarItem } from './widgets/timelog/timelog-entry-form/daybook-grid-items-bar/display-grid-bar-item.class';
import { TimelogEntryItem } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { faSun, faList } from '@fortawesome/free-solid-svg-icons';
import { TimelogDisplayGridItem } from './widgets/timelog/timelog-display-grid-item.class';
import { TimelogEntryFormService } from './widgets/timelog/timelog-entry-form/timelog-entry-form.service';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { DisplayGridItemsBar } from './widgets/timelog/timelog-entry-form/daybook-grid-items-bar/daybook-grid-items-bar.class';
import { DaybookTimePosition } from './daybook-time-position-form/daybook-time-position.enum';

@Injectable({
  providedIn: 'root'
})
export class DaybookDisplayService {

  constructor(
    private daybookControllerService: DaybookControllerService,
    private tlefService: TimelogEntryFormService,
    private toolBoxService: ToolboxService) { }

  private _widgetChanged$: BehaviorSubject<DaybookWidgetType> = new BehaviorSubject(DaybookWidgetType.TIMELOG);
  private _displayUpdated$: Subject<boolean> = new Subject();

  private _currentZoom: TimelogZoomControllerItem;
  private _zoomItems: TimelogZoomControllerItem[] = [];
  private _displayStartTime: moment.Moment;
  private _displayEndTime: moment.Moment;

  private _timeDelineators: TimelogDelineator[] = [];
  private _timelogDisplayGrid: TimelogDisplayGrid;

  private _gridBar: DisplayGridItemsBar;

  public get dateYYYYMMDD(): string { return this.daybookControllerService.activeDayController.dateYYYYMMDD; }
  public get activeDayController(): DaybookController { return this.daybookControllerService.activeDayController; }
  public get todayController(): DaybookController { return this.daybookControllerService.todayController; }
  public get activeDayController$(): Observable<DaybookController> { return this.daybookControllerService.activeDayController$; }
  public get clock(): moment.Moment { return this.daybookControllerService.clock; }


  public get widgetChanged$(): Observable<DaybookWidgetType> { return this._widgetChanged$.asObservable(); }
  public get widgetChanged(): DaybookWidgetType { return this._widgetChanged$.getValue(); }
  public get displayUpdated$(): Observable<boolean> { return this._displayUpdated$.asObservable(); }

  public get displayStartTime(): moment.Moment { return this._displayStartTime; }
  public get displayEndTime(): moment.Moment { return this._displayEndTime; }
  public get wakeupTime(): moment.Moment { return this.activeDayController.wakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this.activeDayController.fallAsleepTime; }

  public get batteryLevel(): number { return this.todayController.batteryLevel; }

  public get timelogDisplayGrid(): TimelogDisplayGrid { return this._timelogDisplayGrid; }
  public get timelogDelineators(): TimelogDelineator[] { return this._timeDelineators; }

  public get gridBar(): DisplayGridItemsBar { return this._gridBar; }
  public get gridBarItems(): DisplayGridBarItem[] { return this.gridBar.gridBarItems; }
  public get activeGridBarItem$(): Observable<DisplayGridBarItem> { return this.gridBar.activeGridBarItem$; }
  public get activeGridBarItem(): DisplayGridBarItem { return this.gridBar.activeGridBarItem; }

  public get zoomItems(): TimelogZoomControllerItem[] { return this._zoomItems; }
  public get currentZoom(): TimelogZoomControllerItem { return this._currentZoom; }

  public setDaybookWidget(widget: DaybookWidgetType) {
    this._widgetChanged$.next(widget);
  }

  public onZoomChanged(newZoomValue: TimelogZoomControllerItem) {
    this._currentZoom = newZoomValue;
    this._updateDisplay();
  }


  public initiate() {
    this.activeDayController$.subscribe((activeDayChanged) => {
      this._updateDisplay();
    });
    this._updateDisplay();
    this._currentZoom = this.zoomItems[0];
    this.toolBoxService.toolIsOpen$.subscribe((toolIsOpen: boolean) => {
      if (toolIsOpen === false) {
        this._closeGridItem();
      }
    });
  }

  private _updateDisplay() {
    this._buildZoomItems();
    this._loadTimelogDelineators();
    let newGrid: TimelogDisplayGrid = new TimelogDisplayGrid(this.displayStartTime, this.displayEndTime, this._timeDelineators, this.activeDayController);
    this._timelogDisplayGrid = newGrid;
    this._buildGridBarItems();
    this._displayUpdated$.next(true);
  }



  private _buildGridBarItems() {

    let currentActiveItem;
    if (this.gridBar) {
      if (this.activeGridBarItem) {
        currentActiveItem = this.activeGridBarItem;
      }

    }
    let gridBar: DisplayGridItemsBar = new DisplayGridItemsBar(this._timeDelineators, this.activeDayController, this.clock, this.tlefService, currentActiveItem);
    this._gridBar = gridBar;
  }

  public openWakeupTime() {
    this._openDisplayGridItem(this.gridBarItems[0]);
  }

  public openFallAsleepTime() {
    this._openDisplayGridItem(this.gridBarItems[this.gridBarItems.length-1]);
  }

  public openNewCurrentTimelogEntry() {
    const currentTimePosition = this.daybookControllerService.todayController.timePosition;
    console.log("currentTimePosition is " + currentTimePosition);
    if(currentTimePosition === DaybookTimePosition.NORMAL){
      
      const newCurrentTLE = this.daybookControllerService.todayController.getNewCurrentTLE();
      const foundGridItem = this.gridBarItems.find(item => {
        return item.availabilityType === DaybookAvailabilityType.AVAILABLE
          && item.startTime.isSame(newCurrentTLE.startTime) && item.endTime.isSame(newCurrentTLE.endTime);
      });
      if (foundGridItem) {
        this._openDisplayGridItem(foundGridItem);
      } else {
        console.log("Error: could not find new current tlef")
      }
    }else {
      this.toolBoxService.openNewDayForm();
    }
  }

  public openTimelogGridItem(gridItem: TimelogDisplayGridItem) {
    // console.log("opening grid item: " , gridItem)
    const currentTimePosition = this.daybookControllerService.todayController.timePosition;
    if(currentTimePosition === DaybookTimePosition.NORMAL){
      if (gridItem.isMerged) {
        if (gridItem.timelogEntries.length >= 2) {
          let biggest = gridItem.timelogEntries[0];
          gridItem.timelogEntries.forEach((item) => {
            if (item.durationMilliseconds > biggest.durationMilliseconds) {
              biggest = item;
            }
          });
          const foundItem = this.gridBarItems.find(gridBarItem => {
            return gridBarItem.availabilityType === DaybookAvailabilityType.TIMELOG_ENTRY
              && gridBarItem.startTime.isSameOrAfter(biggest.startTime) && gridBarItem.endTime.isSame(biggest.endTime);
          });
          if (foundItem) {
            this._openDisplayGridItem(foundItem);
          } else {
            console.log("error finding item");
          }
        } else {
          console.log("Error with timelog entries")
        }
      } else {
        const foundItem = this.gridBarItems.find(item => {
          return item.availabilityType === gridItem.availability
            && item.startTime.isSame(gridItem.startTime) && item.endTime.isSame(gridItem.endTime);
        });
        if (foundItem) {
          this._openDisplayGridItem(foundItem);
        } else {
          console.log("Error finding grid item");
        }
      }
    }else{
      this.toolBoxService.openNewDayForm();
    }
  }

  private _openDisplayGridItem(item: DisplayGridBarItem) {
    this.gridBar.openDisplayGridItem(item);
  }

  public onClickGridItem(gridItem: DisplayGridBarItem) {
    this.gridBar.openDisplayGridItem(gridItem);
  }

  public gridBarGoRight() {
    this.gridBar.goRight();
  }
  public gridBarGoLeft() {
    this.gridBar.goLeft();
  }


  private _closeGridItem() {
    this.gridBar.closeGridItem();
  }

  private _buildZoomItems() {
    let zoomItems: TimelogZoomControllerItem[] = [];
    console.log("Active Day controller: " , this.daybookControllerService.activeDayController.dateYYYYMMDD);
    let startTime = moment(this.daybookControllerService.activeDayController.wakeupTime);
    let endTime = moment(this.daybookControllerService.activeDayController.fallAsleepTime);
    console.log("Start time is: " + startTime.format('YYYY-MM-DD hh:mm a'))
    console.log("End time is : " + endTime.format('YYYY-MM-DD hh:mm a'))

    const wakeItem = new TimelogZoomControllerItem(startTime, endTime, TimelogZoomType.AWAKE);
    wakeItem.icon = faSun;

    const listItem = new TimelogZoomControllerItem(startTime, endTime, TimelogZoomType.LIST);
    listItem.icon = faList;

    zoomItems = [wakeItem, listItem];

    this._zoomItems = zoomItems;

    this._displayStartTime = TimeUtilities.roundDownToFloor(moment(startTime).subtract(15, 'minutes'), 30);
    this._displayEndTime = TimeUtilities.roundUpToCeiling(moment(endTime).add(15, 'minutes'), 30);

    console.log("Updating times: displayStartTime = " + this._displayStartTime.format('YYYY-MM-DD hh:mm a') )
    console.log("Updating times: displayEndTime = " + this._displayEndTime.format('YYYY-MM-DD hh:mm a'))
  }

  private _loadTimelogDelineators() {
    const timelogDelineators: TimelogDelineator[] = [];
    const frameStartDelineator = new TimelogDelineator(this.displayStartTime, TimelogDelineatorType.FRAME_START);
    const fameEndDelineator = new TimelogDelineator(this.displayEndTime, TimelogDelineatorType.FRAME_END);
    const wakeupDelineator = new TimelogDelineator(this.wakeupTime, TimelogDelineatorType.WAKEUP_TIME);
    const fallAsleepDelineator = new TimelogDelineator(this.fallAsleepTime, TimelogDelineatorType.FALLASLEEP_TIME);
    console.log("Frame start is : " + this.displayStartTime.format('YYYY-MM-DD hh:mm a'))
    console.log("Frame end is : " + this.displayEndTime.format('YYYY-MM-DD hh:mm a'));
    timelogDelineators.push(frameStartDelineator);
    timelogDelineators.push(wakeupDelineator);
    timelogDelineators.push(fallAsleepDelineator);
    timelogDelineators.push(fameEndDelineator);
    if (this.activeDayController.isToday) {
      const nowTime = moment(this.clock).startOf('minute');
      timelogDelineators.push(new TimelogDelineator(nowTime, TimelogDelineatorType.NOW));
    }
    // console.log("current: " , this._activeDayController.savedTimeDelineators.length)
    this.activeDayController.savedTimeDelineators.forEach((timeDelineation) => {
      // console.log("a saved delineator: " + timeDelineation.format('hh:mm a'))
      timelogDelineators.push(new TimelogDelineator(timeDelineation, TimelogDelineatorType.SAVED_DELINEATOR));
    });
    this.activeDayController.timelogEntryItems.forEach((timelogEntryItem) => {
      const timeDelineatorStart = new TimelogDelineator(timelogEntryItem.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
      const timeDelineatorEnd = new TimelogDelineator(timelogEntryItem.endTime, TimelogDelineatorType.TIMELOG_ENTRY_END);
      timeDelineatorStart.nextDelineator = timeDelineatorEnd;
      timeDelineatorStart.timelogEntryStart = timelogEntryItem;
      timeDelineatorEnd.previousDelineator = timeDelineatorStart;
      timeDelineatorEnd.timelogEntryEnd = timelogEntryItem;
      timelogDelineators.push(timeDelineatorStart);
      timelogDelineators.push(timeDelineatorEnd);
    });
    const sortedDelineators = this._sortDelineators(timelogDelineators);
    
    this._timeDelineators = sortedDelineators;
    console.log("This._timeDelineators = " , this._timeDelineators);
    // let logItems: string[] = [];
    // sortedDelineators.forEach(sd => logItems.push("  Sorted Delineator: " + sd.time.format('YYYY-MM-DD hh:mm a') + " : " + sd.delineatorType))
    // this._log = this._log.concat(logItems);
  }

  private _sortDelineators(timelogDelineators: TimelogDelineator[]): TimelogDelineator[] {
    let sortedDelineators = timelogDelineators
      .filter((delineator) => { return delineator.time.isSameOrAfter(this.displayStartTime) && delineator.time.isSameOrBefore(this.displayEndTime); })
      .sort((td1, td2) => {
        if (td1.time.isBefore(td2.time)) { return -1; }
        else if (td1.time.isAfter(td2.time)) { return 1; }
        else {
          return 0;
        }
      });
    const priority = [
      TimelogDelineatorType.FRAME_START,
      TimelogDelineatorType.FRAME_END,
      TimelogDelineatorType.NOW,
      TimelogDelineatorType.WAKEUP_TIME,
      TimelogDelineatorType.FALLASLEEP_TIME,
      TimelogDelineatorType.TIMELOG_ENTRY_START,
      TimelogDelineatorType.TIMELOG_ENTRY_END,
      TimelogDelineatorType.SAVED_DELINEATOR,
      TimelogDelineatorType.DAY_STRUCTURE,
    ];
    if (sortedDelineators.length > 0) {
      for (let i = 1; i < sortedDelineators.length; i++) {
        if (sortedDelineators[i].time.isSame(sortedDelineators[i - 1].time)) {
          const thisPriorityIndex = priority.indexOf(sortedDelineators[i].delineatorType);
          const prevPriorityIndex = priority.indexOf(sortedDelineators[i - 1].delineatorType);
          // lower priority index is higher priority
          if (thisPriorityIndex < prevPriorityIndex) {
            sortedDelineators.splice(i - 1, 1);
            i--;
          } else if (thisPriorityIndex > prevPriorityIndex) {
            sortedDelineators.splice(i, 1);
            i--;
          } else {
            console.log('Same? ', priority[thisPriorityIndex], priority[prevPriorityIndex])
            console.log('Error somehow with delineators.' + thisPriorityIndex + " ,  " + prevPriorityIndex)
            // console.log(priority[thisPriorityIndex])
            // sortedDelineators.forEach((item)=>{
            //   console.log("   " + item.time.format('hh:mm a') + "  Type:" + item.delineatorType)
            // })
          }
        }
      }
    }
    // console.log("SORTED DELINEATORS: ")
    // sortedDelineators.forEach((item)=>{
    //   console.log("   " + item.time.format('hh:mm a') + " : " + item.delineatorType) 
    // })
    return sortedDelineators;
  }

  // private _setDefaultDayStructureTimes() {
  //   this._defaultDayStructureTimes = [
  //     moment(this.activeDayController.dateYYYYMMDD).hour(0).startOf('hour'),
  //     moment(this.activeDayController.dateYYYYMMDD).hour(6).startOf('hour'),
  //     moment(this.activeDayController.dateYYYYMMDD).hour(12).startOf('hour'),
  //     moment(this.activeDayController.dateYYYYMMDD).hour(18).startOf('hour'),
  //     moment(this.activeDayController.dateYYYYMMDD).hour(24).startOf('hour'),
  //   ];
  // }

}
