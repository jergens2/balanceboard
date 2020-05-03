import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { TimelogZoomControllerItem } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-controller-item.class';
import { DaybookControllerService } from './controller/daybook-controller.service';
import { DaybookController } from './controller/daybook-controller.class';
import { DaybookWidgetType } from './widgets/daybook-widget.class';
import { TimelogZoomType } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-type.enum';
import * as moment from 'moment';
import { TimeUtilities } from '../../shared/utilities/time-utilities/time-utilities';
import { TimelogDisplayGrid } from './widgets/timelog/timelog-display-grid-class';
import { TimelogDelineator, TimelogDelineatorType } from './widgets/timelog/timelog-delineator.class';
import { TimelogEntryItem } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { faSun, faList } from '@fortawesome/free-solid-svg-icons';
import { TimelogDisplayGridItem } from './widgets/timelog/timelog-display-grid-item.class';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { TLEFController } from './widgets/timelog/timelog-entry-form/TLEF-controller.class';
import { DaybookDisplayUpdate, DaybookDisplayUpdateType } from './controller/items/daybook-display-update.interface';
import { ToolType } from '../../toolbox-menu/tool-type.enum';
import { TLEFFormCase } from './widgets/timelog/timelog-entry-form/tlef-form-case.enum';
import { ActivityCategoryDefinitionService } from '../activities/api/activity-category-definition.service';

@Injectable({
  providedIn: 'root'
})
export class DaybookDisplayService {

  constructor(
    private daybookControllerService: DaybookControllerService,
    private activitiesService: ActivityCategoryDefinitionService,
    private toolBoxService: ToolboxService) { }

  private _widgetChanged$: BehaviorSubject<DaybookWidgetType> = new BehaviorSubject(DaybookWidgetType.TIMELOG);
  private _displayUpdated$: Subject<DaybookDisplayUpdate> = new Subject();

  private _currentZoom: TimelogZoomControllerItem;
  private _zoomItems: TimelogZoomControllerItem[] = [];
  private _displayStartTime: moment.Moment;
  private _displayEndTime: moment.Moment;

  private _timeDelineators: TimelogDelineator[] = [];
  private _timelogDisplayGrid: TimelogDisplayGrid;

  private _tlefController: TLEFController;

  public get dateYYYYMMDD(): string { return this.daybookControllerService.activeDayController.dateYYYYMMDD; }
  public get activeDayController(): DaybookController { return this.daybookControllerService.activeDayController; }
  public get todayController(): DaybookController { return this.daybookControllerService.todayController; }
  public get clock(): moment.Moment { return this.daybookControllerService.clock; }


  public get widgetChanged$(): Observable<DaybookWidgetType> { return this._widgetChanged$.asObservable(); }
  public get widgetChanged(): DaybookWidgetType { return this._widgetChanged$.getValue(); }
  public get displayUpdated$(): Observable<DaybookDisplayUpdate> { return this._displayUpdated$.asObservable(); }

  public get displayStartTime(): moment.Moment { return this._displayStartTime; }
  public get displayEndTime(): moment.Moment { return this._displayEndTime; }
  public get wakeupTime(): moment.Moment { return this.activeDayController.wakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this.activeDayController.fallAsleepTime; }

  public get batteryLevel(): number { return this.todayController.batteryLevel; }

  public get timelogDisplayGrid(): TimelogDisplayGrid { return this._timelogDisplayGrid; }
  public get timelogDelineators(): TimelogDelineator[] { return this._timeDelineators; }

  public get zoomItems(): TimelogZoomControllerItem[] { return this._zoomItems; }
  public get currentZoom(): TimelogZoomControllerItem { return this._currentZoom; }

  public get tlefController(): TLEFController { return this._tlefController; }

  public setDaybookWidget(widget: DaybookWidgetType) { this._widgetChanged$.next(widget); }

  public openWakeupTime() { this.tlefController.openWakeupTime(); }
  public openFallAsleepTime() { this.tlefController.openFallAsleepTime(); }


  private _drawDelineators: { start: TimelogDelineator, end: TimelogDelineator };

  public drawNewTimelogEntry(drawTLE: TimelogEntryItem) {

    const startDelineator = new TimelogDelineator(drawTLE.startTime, TimelogDelineatorType.DRAWING_TLE_START);
    const endDelineator = new TimelogDelineator(drawTLE.endTime, TimelogDelineatorType.DRAWING_TLE_END);
    this._drawDelineators = {
      start: startDelineator,
      end: endDelineator,
    }
    this._updateDisplay({
      type: DaybookDisplayUpdateType.DRAW_TIMELOG_ENTRY,
      controller: this.activeDayController,
    });
    // this.tlefController.drawNewTimelogEntry(drawTLE);
  }

  public onZoomChanged(newZoomValue: TimelogZoomControllerItem) {
    this._currentZoom = newZoomValue;
    this._updateDisplay({
      type: DaybookDisplayUpdateType.ZOOM,
      controller: this.activeDayController,
    });
  }

  private _subs: Subscription[] = [];
  public reinitiate() {
    this._subs.forEach(sub => sub.unsubscribe());
    this._subs = [];
    this._subs = [
      this.daybookControllerService.displayUpdated$.subscribe((update: DaybookDisplayUpdate) => {
        this._updateDisplay(update);
      }),
    ];
    
    this._updateDisplay({
      type: DaybookDisplayUpdateType.DEFAULT,
      controller: this.daybookControllerService.activeDayController,
    });
    this._currentZoom = this.zoomItems[0];
  }

  private _updateDisplay(update: DaybookDisplayUpdate) {
    console.log("Daybook Display update: ", update.type);
    this._buildZoomItems();
    this._updateTimelogDelineators();


    if (!this._tlefController) {
      this._tlefController = new TLEFController(this._timeDelineators, this.activeDayController, this.clock, this.toolBoxService, this.activitiesService);
    } else {
      this._tlefController.update(this._timeDelineators, this.activeDayController, this.clock, update);
    }
    this._updateTLEFSubscription();
    let newGrid: TimelogDisplayGrid = new TimelogDisplayGrid(this.displayStartTime, this.displayEndTime, this._timeDelineators, this.activeDayController, this._tlefController);
    this._timelogDisplayGrid = newGrid;
    // this._updateDrawingTLE(update);
    this._displayUpdated$.next(update);
  }

  // private _updateDrawingTLE(update: DaybookDisplayUpdate) {
    
  //   if (this.tlefController.formIsOpen && update.type === DaybookDisplayUpdateType.DRAW_TIMELOG_ENTRY) {
  //     console.log("Warning disabled")
  //     // this._timelogDisplayGrid.items
  //     // this._timelogDisplayGrid.createTimelogEntry(openItem.getInitialTLEValue());
      
  //   }
  // }

  private _tlefSubscription: Subscription = new Subscription();
  private _updateTLEFSubscription() {
    this._tlefSubscription.unsubscribe();
    this._tlefSubscription = this._tlefController.onFormClosed$.subscribe((formIsClosed: boolean) => {
      if (formIsClosed) {
        this._updateDisplay({
          type: DaybookDisplayUpdateType.DEFAULT,
          controller: this.daybookControllerService.activeDayController,
        });
      }
    });
  }

  public openNewCurrentTimelogEntry() {
    const currentTimePosition = this.daybookControllerService.todayController.timePosition;
    const newCurrentTLE = this.daybookControllerService.todayController.getNewCurrentTLE();
    this.tlefController.openNewCurrentTimelogEntry(currentTimePosition, newCurrentTLE);
  }

  public openTimelogGridItem(gridItem: TimelogDisplayGridItem) {
    // console.log("Opener method:  in the daybook display service")
    // console.log("opening grid item: " + gridItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + gridItem.endTime.format('YYYY-MM-DD hh:mm a'));
    const currentTimePosition = this.daybookControllerService.todayController.timePosition;
    this.tlefController.openTimelogGridItem(gridItem, currentTimePosition);
  }



  private _buildZoomItems() {
    let zoomItems: TimelogZoomControllerItem[] = [];
    // console.log("Active Day controller: " , this.daybookControllerService.activeDayController.dateYYYYMMDD);
    let startTime = moment(this.daybookControllerService.activeDayController.wakeupTime);
    let endTime = moment(this.daybookControllerService.activeDayController.fallAsleepTime);
    // console.log("Start time is: " + startTime.format('YYYY-MM-DD hh:mm a'))
    // console.log("***End time is : " + endTime.format('YYYY-MM-DD hh:mm a'))
    const wakeItem = new TimelogZoomControllerItem(startTime, endTime, TimelogZoomType.AWAKE);
    wakeItem.icon = faSun;
    const listItem = new TimelogZoomControllerItem(startTime, endTime, TimelogZoomType.LIST);
    listItem.icon = faList;
    zoomItems = [wakeItem, listItem];
    this._zoomItems = zoomItems;
    this._displayStartTime = TimeUtilities.roundDownToFloor(moment(startTime).subtract(15, 'minutes'), 30);
    this._displayEndTime = TimeUtilities.roundUpToCeiling(moment(endTime).add(15, 'minutes'), 30);
    // console.log("Updating times: displayStartTime = " + this._displayStartTime.format('YYYY-MM-DD hh:mm a') )
    // console.log("Updating times: displayEndTime = " + this._displayEndTime.format('YYYY-MM-DD hh:mm a'))
  }

  private _updateTimelogDelineators() {
    let nowLineCrossesTLE: boolean = false;
    const nowTime = moment(this.clock).startOf('minute');
    const timelogDelineators: TimelogDelineator[] = [];
    const frameStartDelineator = new TimelogDelineator(this.displayStartTime, TimelogDelineatorType.FRAME_START);
    const fameEndDelineator = new TimelogDelineator(this.displayEndTime, TimelogDelineatorType.FRAME_END);
    const wakeupDelineator = new TimelogDelineator(this.wakeupTime, TimelogDelineatorType.WAKEUP_TIME);
    const fallAsleepDelineator = new TimelogDelineator(this.fallAsleepTime, TimelogDelineatorType.FALLASLEEP_TIME);
    timelogDelineators.push(frameStartDelineator);
    timelogDelineators.push(wakeupDelineator);
    timelogDelineators.push(fallAsleepDelineator);
    timelogDelineators.push(fameEndDelineator);

    let drawDelineatorStart: TimelogDelineator;
    let drawDelineatorEnd: TimelogDelineator;
    let drawItemsPushed: boolean = false;
    if (this._drawDelineators) {
      drawDelineatorStart = this._drawDelineators.start;
      drawDelineatorEnd = this._drawDelineators.end;
      this._drawDelineators = null;
    }


    // console.log("   current: " , timelogDelineators.length)
    this.activeDayController.savedTimeDelineators.forEach((timeDelineation) => {
      // console.log("a saved delineator: " + timeDelineation.format('hh:mm a'))
      timelogDelineators.push(new TimelogDelineator(timeDelineation, TimelogDelineatorType.SAVED_DELINEATOR));
    });
    // console.log("   current: " , timelogDelineators.length)
    this.activeDayController.timelogEntryItems.forEach((timelogEntryItem) => {
      const timeDelineatorStart = new TimelogDelineator(timelogEntryItem.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
      const timeDelineatorEnd = new TimelogDelineator(timelogEntryItem.endTime, TimelogDelineatorType.TIMELOG_ENTRY_END);
      timeDelineatorStart.nextDelineator = timeDelineatorEnd;
      timeDelineatorStart.timelogEntryStart = timelogEntryItem;
      timeDelineatorEnd.previousDelineator = timeDelineatorStart;
      timeDelineatorEnd.timelogEntryEnd = timelogEntryItem;
      timelogDelineators.push(timeDelineatorStart);
      timelogDelineators.push(timeDelineatorEnd);
      if (nowTime.isSameOrAfter(timelogEntryItem.startTime) && nowTime.isSameOrBefore(timelogEntryItem.endTime)) {
        nowLineCrossesTLE = true;
      }
    });

    if (this.tlefController) {
      if (this.tlefController.formIsOpen) {
        const openItem = this.tlefController.currentlyOpenTLEFItem;
        const newStartDelineator = new TimelogDelineator(openItem.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
        const newEndDelineator = new TimelogDelineator(openItem.endTime, TimelogDelineatorType.TIMELOG_ENTRY_END);
        if (nowTime.isSameOrAfter(newStartDelineator.time) && nowTime.isSameOrBefore(openItem.endTime)) {
          nowLineCrossesTLE = true;
        }
        if (openItem.isDrawing) {
          if(drawDelineatorStart && drawDelineatorEnd){
            timelogDelineators.push(drawDelineatorStart);
            timelogDelineators.push(drawDelineatorEnd);
          }else{
            timelogDelineators.push(openItem.startDelineator);
            timelogDelineators.push(openItem.endDelineator);
          }
          drawItemsPushed = true;
        }
      }
    }
    if(!drawItemsPushed){
      if(drawDelineatorStart && drawDelineatorEnd){
        timelogDelineators.push(drawDelineatorStart);
        timelogDelineators.push(drawDelineatorEnd);
      }
    }
    if (this.activeDayController.isToday) {
      const nowDelineator = new TimelogDelineator(nowTime, TimelogDelineatorType.NOW)
      if (nowLineCrossesTLE) {
        nowDelineator.setNowLineCrossesTLE();
      }
      timelogDelineators.push(nowDelineator);
    }
    const sortedDelineators = this._sortDelineators(timelogDelineators);
    this._timeDelineators = sortedDelineators;
  }

  private _sortDelineators(timelogDelineators: TimelogDelineator[]): TimelogDelineator[] {
    // console.log("   Display start time is: " + this.displayStartTime.format('YYYY-MM-DD hh:mm a'));
    // console.log("   Display end time is: " + this.displayEndTime.format('YYYY-MM-DD hh:mm a'))
    // console.log("   current: " , timelogDelineators.length)
    let sortedDelineators = timelogDelineators
      .filter((delineator) => { return delineator.time.isSameOrAfter(this.displayStartTime) && delineator.time.isSameOrBefore(this.displayEndTime); })
      .sort((td1, td2) => {
        if (td1.time.isBefore(td2.time)) { return -1; }
        else if (td1.time.isAfter(td2.time)) { return 1; }
        else {
          return 0;
        }
      });
    // console.log("   current: " , sortedDelineators.length)
    const priority = [
      TimelogDelineatorType.FRAME_START,
      TimelogDelineatorType.FRAME_END,
      TimelogDelineatorType.DRAWING_TLE_END,
      TimelogDelineatorType.DRAWING_TLE_START,
      TimelogDelineatorType.WAKEUP_TIME,
      TimelogDelineatorType.FALLASLEEP_TIME,
      TimelogDelineatorType.TIMELOG_ENTRY_START,
      TimelogDelineatorType.TIMELOG_ENTRY_END,
      TimelogDelineatorType.NOW,
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
            // console.log('Same? ', priority[thisPriorityIndex], priority[prevPriorityIndex])
            // console.log('Error somehow with delineators.' + thisPriorityIndex + " ,  " + prevPriorityIndex)
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
