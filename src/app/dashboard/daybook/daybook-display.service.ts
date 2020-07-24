import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { TimelogZoomControllerItem } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-controller-item.class';
import { DaybookControllerService } from './controller/daybook-controller.service';
import { DaybookController } from './controller/daybook-controller.class';
import { DaybookWidgetType } from './widgets/daybook-widget.class';
import { TimelogZoomType } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-type.enum';
import * as moment from 'moment';
import { TimelogDisplayGrid } from './widgets/timelog/timelog-display-grid-class';
import { TimelogDelineator, TimelogDelineatorType } from './widgets/timelog/timelog-delineator.class';
import { TimelogEntryItem } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { faSun, faList } from '@fortawesome/free-solid-svg-icons';
import { TimelogDisplayGridItem } from './widgets/timelog/timelog-display-grid-item.class';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { TLEFController } from './widgets/timelog/timelog-entry-form/TLEF-controller.class';
import { DaybookDisplayUpdate, DaybookDisplayUpdateType } from './controller/items/daybook-display-update.interface';
import { ActivityCategoryDefinitionService } from '../activities/api/activity-category-definition.service';
import { SleepManagerService } from './sleep-manager/sleep-manager.service';
import { DaybookSleepCycle } from './sleep-manager/sleep-cycle/daybook-sleep-cycle.class';
import { SleepManager } from './sleep-manager/sleep-manager.class';
import { DaybookTimeSchedule } from './api/daybook-time-schedule/daybook-time-schedule.class';
import { ActivityTree } from '../activities/api/activity-tree.class';

@Injectable({
  providedIn: 'root'
})
export class DaybookDisplayService {

  constructor(
    private daybookControllerService: DaybookControllerService,
    private activitiesService: ActivityCategoryDefinitionService,
    private toolBoxService: ToolboxService,
    private sleepService: SleepManagerService) { }

  private _widgetChanged$: BehaviorSubject<DaybookWidgetType> = new BehaviorSubject(DaybookWidgetType.TIMELOG);
  private _displayUpdated$: Subject<DaybookDisplayUpdate> = new Subject();

  private _currentZoom: TimelogZoomControllerItem;
  private _zoomItems: TimelogZoomControllerItem[] = [];

  private _daybookSchedule: DaybookTimeSchedule;
  private _tlefController: TLEFController;
  private _timelogDisplayGrid: TimelogDisplayGrid;

  private _drawTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
  private _createTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);

  private _subs: Subscription[] = [];

  public get dateYYYYMMDD(): string { return this.daybookControllerService.activeDayController.dateYYYYMMDD; }
  public get activeDayController(): DaybookController { return this.daybookControllerService.activeDayController; }
  public get todayController(): DaybookController { return this.daybookControllerService.todayController; }
  public get clock(): moment.Moment { return this.daybookControllerService.clock; }

  // public get isLoading$(): Observable<boolean> { return this._serviceIsLoading$.asObservable(); }

  public get widgetChanged$(): Observable<DaybookWidgetType> { return this._widgetChanged$.asObservable(); }
  public get widgetChanged(): DaybookWidgetType { return this._widgetChanged$.getValue(); }
  public get displayUpdated$(): Observable<DaybookDisplayUpdate> { return this._displayUpdated$.asObservable(); }

  public get displayStartTime(): moment.Moment { return this._daybookSchedule.startTime; }
  public get displayEndTime(): moment.Moment { return this._daybookSchedule.endTime; }
  public get wakeupTime(): moment.Moment { return this._daybookSchedule.wakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this._daybookSchedule.fallAsleepTime; }


  public get zoomItems(): TimelogZoomControllerItem[] { return this._zoomItems; }
  public get currentZoom(): TimelogZoomControllerItem { return this._currentZoom; }

  public get daybookSchedule(): DaybookTimeSchedule { return this._daybookSchedule; }
  public get tlefController(): TLEFController { return this._tlefController; }

  public get timelogDisplayGrid(): TimelogDisplayGrid { return this._timelogDisplayGrid; }
  public get timelogDelineators(): TimelogDelineator[] { return this._daybookSchedule.displayDelineators; }

  public get currentlyDrawingTLE$(): Observable<TimelogEntryItem> { return this._drawTLE$.asObservable(); }
  public get currentlyDrawingTLE(): TimelogEntryItem { return this._drawTLE$.getValue(); }
  public get creatingNewTLE$(): Observable<TimelogEntryItem> { return this._createTLE$.asObservable(); }
  public get creatingNewTLE(): TimelogEntryItem { return this._createTLE$.getValue(); }


  public onStartDrawingTLE(drawTLE: TimelogEntryItem) { this._drawTLE$.next(drawTLE); }
  public onCreateNewTimelogEntry(drawStartDel: TimelogDelineator, drawEndDel: TimelogDelineator) {

    this.daybookSchedule.onCreateNewTimelogEntry(drawStartDel, drawEndDel);
    this.tlefController.onCreateNewTimelogEntry(this.daybookSchedule);
    this.timelogDisplayGrid.update(this.daybookSchedule);
  }

  public setDaybookWidget(widget: DaybookWidgetType) { this._widgetChanged$.next(widget); }
  public openNewCurrentTimelogEntry() { this.tlefController.openNewCurrentTimelogEntry(); }
  public openTimelogGridItem(gridItem: TimelogDisplayGridItem) { this.tlefController.openTimelogGridItem(gridItem); }
  public openTLEDelineator(delineator: TimelogDelineator) { this.tlefController.openTLEDelineator(delineator); }
  public openWakeupTime() { this.tlefController.openWakeupTime(); }
  public openFallAsleepTime() { this.tlefController.openFallAsleepTime(); }

  public onZoomChanged(newZoomValue: TimelogZoomControllerItem) {
    this._currentZoom = newZoomValue;
    this._updateDisplay({
      type: DaybookDisplayUpdateType.ZOOM,
      controller: this.activeDayController,
    });
  }

  public reinitiate() {
    this._subs.forEach(sub => sub.unsubscribe());
    this._subs = [];
    this._subs = [
      this.daybookControllerService.displayUpdated$.subscribe((update: DaybookDisplayUpdate) => {
        // console.log("  * DaybookControllerService.displayUpdated$: ", update.type)
        if (update.type === DaybookDisplayUpdateType.CLOCK) {
          if (moment().format('YYYY-MM-DD') === update.controller.dateYYYYMMDD) {
            this._updateDisplay(update);
          }
        } else {
          this._updateDisplay(update);
        }
      }),
    ];
    this._updateDisplay({
      type: DaybookDisplayUpdateType.DEFAULT,
      controller: this.daybookControllerService.activeDayController,
    });
    this._currentZoom = this.zoomItems[0];
  }

  private _updateDisplay(update: DaybookDisplayUpdate) {
    // console.log("* * * * * Daybook Display update: " + update.controller.dateYYYYMMDD, update.type);
    this._updateDaybookSchedule(update);
    this._updateTimelogDisplayGrid();
    this._updateTlefController(update);
    this._buildZoomItems();
    this._displayUpdated$.next(update);
  }


  private _updateDaybookSchedule(update: DaybookDisplayUpdate) {
    const isToday = update.controller.dateYYYYMMDD === moment().format('YYYY-MM-DD');
    if (isToday) {
      const sleepCycle: DaybookSleepCycle = this.sleepService.sleepManager.currentSleepCycle;
      this._daybookSchedule = new DaybookTimeSchedule(this.dateYYYYMMDD, sleepCycle, update.controller);
    } else {
      const sleepCycle: DaybookSleepCycle = this.sleepService.sleepManager.getSleepCycleForDate(update.controller.dateYYYYMMDD, update.controller.dayItems);
      this._daybookSchedule = new DaybookTimeSchedule(this.dateYYYYMMDD, sleepCycle, update.controller);
    }
  }
  private _updateTimelogDisplayGrid() {
    if (!this._timelogDisplayGrid) {
      this._timelogDisplayGrid = new TimelogDisplayGrid(this._daybookSchedule);
    } else {
      this._timelogDisplayGrid.update(this._daybookSchedule)
    }
  }
  private _updateTlefController(update: DaybookDisplayUpdate) {
    if (!this._tlefController) {
      this._tlefController = new TLEFController(this._daybookSchedule, this.activeDayController, this.toolBoxService, this.activitiesService);
    } else {
      this._tlefController.update(update, this._daybookSchedule, this.activeDayController);
    }
    this._updateTLEFSubscriptions();
    if (this._tlefController.formIsOpen) {
      // console.log("* updating TLEF controller.  it was open, so updating active grid item.")
      if (this._tlefController.currentlyOpenTLEFItem.isDrawing) {
        const start = new TimelogDelineator(this.tlefController.currentlyOpenTLEFItem.startTime, TimelogDelineatorType.DRAWING_TLE_START);
        const end = new TimelogDelineator(this.tlefController.currentlyOpenTLEFItem.endTime, TimelogDelineatorType.DRAWING_TLE_END);
        this.onCreateNewTimelogEntry(start, end);
      } else {
        this.timelogDisplayGrid.updateActiveItem(this.tlefController.currentlyOpenTLEFItem);
      }

    }
  }

  private _buildZoomItems() {
    let zoomItems: TimelogZoomControllerItem[] = [];
    const wakeItem = new TimelogZoomControllerItem(this.displayStartTime, this.displayEndTime, TimelogZoomType.AWAKE);
    wakeItem.icon = faSun;
    const listItem = new TimelogZoomControllerItem(this.displayStartTime, this.displayEndTime, TimelogZoomType.LIST);
    listItem.icon = faList;
    zoomItems = [wakeItem, listItem];
    this._zoomItems = zoomItems;
  }


  private _tlefSubscriptions: Subscription[] = [];
  private _updateTLEFSubscriptions() {
    this._tlefSubscriptions.forEach(s => s.unsubscribe());
    this._tlefSubscriptions = [
      this.tlefController.onFormClosed$.subscribe((formIsClosed: boolean) => {
        if (formIsClosed) {
          this._updateDisplay({
            type: DaybookDisplayUpdateType.DEFAULT,
            controller: this.daybookControllerService.activeDayController,
          });
        }
      }),
      this.tlefController.currentlyOpenTLEFItem$.subscribe((tlefItem) => {
        if (tlefItem) {
          this.timelogDisplayGrid.updateActiveItem(tlefItem);
        }
      })
    ];
  }







}
