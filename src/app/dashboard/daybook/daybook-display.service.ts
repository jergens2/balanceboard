import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { TimelogZoomControllerItem } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-controller-item.class';
import { DaybookControllerService } from './controller/daybook-controller.service';
import { DaybookController } from './controller/daybook-controller.class';
import { DaybookWidgetType } from './widgets/daybook-widget.class';
import { TimelogZoomType } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-type.enum';
import * as moment from 'moment';
import { TimeUtilities } from '../../shared/time-utilities/time-utilities';
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
import { SleepManagerService } from './sleep-manager/sleep-manager.service';
import { DaybookSleepInputDataItem } from './api/data-items/daybook-sleep-input-data-item.interface';
import { DaybookTimelogEntryDataItem } from './api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookSleepCycle } from './sleep-manager/sleep-cycle/daybook-sleep-cycle.class';
import { SleepManager } from './sleep-manager/sleep-manager.class';
import { DaybookTimeSchedule } from './api/daybook-time-schedule/daybook-time-schedule.class';
import { TimeScheduleItem } from '../../shared/time-utilities/time-schedule-item.class';
import { DaybookTimeScheduleItem } from './api/daybook-time-schedule/daybook-time-schedule-item.class';

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

  private _schedule: DaybookTimeSchedule;
  private _tlefController: TLEFController;
  private _timelogDisplayGrid: TimelogDisplayGrid;


  private _subs: Subscription[] = [];

  public get dateYYYYMMDD(): string { return this.daybookControllerService.activeDayController.dateYYYYMMDD; }
  public get activeDayController(): DaybookController { return this.daybookControllerService.activeDayController; }
  public get todayController(): DaybookController { return this.daybookControllerService.todayController; }
  public get clock(): moment.Moment { return this.daybookControllerService.clock; }

  // public get isLoading$(): Observable<boolean> { return this._serviceIsLoading$.asObservable(); }

  public get widgetChanged$(): Observable<DaybookWidgetType> { return this._widgetChanged$.asObservable(); }
  public get widgetChanged(): DaybookWidgetType { return this._widgetChanged$.getValue(); }
  public get displayUpdated$(): Observable<DaybookDisplayUpdate> { return this._displayUpdated$.asObservable(); }

  public get displayStartTime(): moment.Moment { return this._schedule.startTime; }
  public get displayEndTime(): moment.Moment { return this._schedule.endTime; }
  public get wakeupTime(): moment.Moment { return this._schedule.wakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this._schedule.fallAsleepTime; }


  public get zoomItems(): TimelogZoomControllerItem[] { return this._zoomItems; }
  public get currentZoom(): TimelogZoomControllerItem { return this._currentZoom; }

  public get schedule(): DaybookTimeSchedule { return this._schedule; }
  public get tlefController(): TLEFController { return this._tlefController; }

  public get timelogDisplayGrid(): TimelogDisplayGrid { return this._timelogDisplayGrid; }
  public get timelogDelineators(): TimelogDelineator[] { return this._schedule.displayDelineators; }


  public setDaybookWidget(widget: DaybookWidgetType) { this._widgetChanged$.next(widget); }

  public openNewCurrentTimelogEntry() {
    // const currentTimePosition = this.daybookControllerService.todayController.timePosition;
    // const newCurrentTLE = this.daybookControllerService.todayController.getNewCurrentTLE();
    this.tlefController.openNewCurrentTimelogEntry();
  }

  public openTimelogGridItem(gridItem: TimelogDisplayGridItem) {
    // console.log("Opener method:  in the daybook display service")
    // console.log("opening grid item: " + gridItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + gridItem.endTime.format('YYYY-MM-DD hh:mm a'));
    // const currentTimePosition = this.daybookControllerService.todayController.timePosition;
    this.tlefController.openTimelogGridItem(gridItem);
  }
  public openWakeupTime() { this.tlefController.openWakeupTime(); }
  public openFallAsleepTime() { this.tlefController.openFallAsleepTime(); }
  public drawNewTimelogEntry(drawTLE: TimelogEntryItem) {

    console.log("WARNING:  to do:  update the time Schedule.  ")
    // const startDelineator = new TimelogDelineator(drawTLE.startTime, TimelogDelineatorType.DRAWING_TLE_START);
    // const endDelineator = new TimelogDelineator(drawTLE.endTime, TimelogDelineatorType.DRAWING_TLE_END);
    // this._drawDelineators = {
    //   start: startDelineator,
    //   end: endDelineator,
    // }
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


  public reinitiate() {
    this._subs.forEach(sub => sub.unsubscribe());
    this._subs = [];
    this._subs = [
      this.daybookControllerService.displayUpdated$.subscribe((update: DaybookDisplayUpdate) => {
        console.log("** UPDATING: ", update.type)
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
    console.log("Daybook Display update: " + update.controller.dateYYYYMMDD, update.type);
    const sleepManager: SleepManager = this.sleepService.sleepManager;
    const sleepCycle: DaybookSleepCycle = sleepManager.sleepCycle;
    this._schedule = new DaybookTimeSchedule(this.dateYYYYMMDD, this.clock, sleepCycle, update.controller);
    this._tlefController = new TLEFController(this._schedule.displayDelineators, this._schedule, this.activeDayController, this.clock, this.toolBoxService, this.activitiesService);
    this._timelogDisplayGrid = new TimelogDisplayGrid(this.displayStartTime, this.displayEndTime, this._schedule.displayDelineators, this._schedule, this.activeDayController);
    this._buildZoomItems();
    this._displayUpdated$.next(update);
  }



  private _tlefSubscription: Subscription = new Subscription();
  private _updateTLEFSubscription() {
    this._tlefSubscription.unsubscribe();
    this._tlefSubscription = this.tlefController.onFormClosed$.subscribe((formIsClosed: boolean) => {
      if (formIsClosed) {
        this._updateDisplay({
          type: DaybookDisplayUpdateType.DEFAULT,
          controller: this.daybookControllerService.activeDayController,
        });
      }
    });
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






}
