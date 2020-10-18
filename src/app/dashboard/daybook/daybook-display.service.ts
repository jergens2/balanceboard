import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { TimelogZoomItem } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-item.class';
import { DaybookWidgetType } from './widgets/daybook-widget.class';
import { TimelogZoomType } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-type.enum';
import * as moment from 'moment';
import { TimelogDelineator } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';
import { TimelogEntryItem } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimelogDisplayGridItem } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-display-grid-item.class';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { TLEFController } from './widgets/timelog/timelog-entry-form/TLEF-controller.class';
import { ActivityHttpService } from '../activities/api/activity-http.service';
import { SleepService } from './sleep-manager/sleep.service';
import { DaybookTimeSchedule } from './display-manager/daybook-time-schedule/daybook-time-schedule.class';
import { DaybookDayItem } from './daybook-day-item/daybook-day-item.class';
import { DaybookHttpService } from './daybook-day-item/daybook-http.service';
import { DaybookDisplayManager } from './display-manager/daybook-display-manager.class';
import { DaybookTimeScheduleBuilder } from './display-manager/daybook-time-schedule/daybook-time-schedule-builder.class';
import { TimelogDisplayGrid } from './widgets/timelog/timelog-large-frame/timelog-body/timelog-display-grid-class';
import { DaybookUpdateAction } from './display-manager/daybook-update-action.enum';
import { DaybookDayItemController } from './daybook-day-item/daybook-day-item-controller';
import { DaybookTimeScheduleActiveItem } from './display-manager/daybook-time-schedule/daybook-time-schedule-active-item.class';

@Injectable({
  providedIn: 'root'
})
export class DaybookDisplayService {

  constructor(
    private activitiesService: ActivityHttpService,
    private toolBoxService: ToolboxService,
    private sleepService: SleepService,
    private httpService: DaybookHttpService) { }

  private _widgetChanged$: BehaviorSubject<DaybookWidgetType> = new BehaviorSubject(DaybookWidgetType.TIMELOG);

  private _clock$: BehaviorSubject<moment.Moment>;
  private _displayUpdated$: Subject<DaybookUpdateAction> = new Subject();

  private _daybookSchedule: DaybookTimeSchedule;
  private _daybookController: DaybookDayItemController;
  private _daybookDisplayManager: DaybookDisplayManager;

  private _drawTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
  private _currentlyDrawing: boolean = false;

  private _closedSub: Subscription = new Subscription();
  private _clockSubs: Subscription[] = [];
  private _todaySub: Subscription = new Subscription();

  public get todayYYYYMMDD(): string { return this.clock.format('YYYY-MM-DD'); }
  public get clock(): moment.Moment { return this._clock$.getValue(); }
  public get clock$(): Observable<moment.Moment> { return this._clock$.asObservable(); }
  public get daybookController(): DaybookDayItemController { return this._daybookController; }
  public get activeDateYYYYMMDD(): string { return this.daybookController.dateYYYYMMDD; }
  public get widgetChanged$(): Observable<DaybookWidgetType> { return this._widgetChanged$.asObservable(); }
  public get widgetChanged(): DaybookWidgetType { return this._widgetChanged$.getValue(); }

  public get displayUpdated$(): Observable<DaybookUpdateAction> { return this._displayUpdated$.asObservable(); }

  public get displayStartTime(): moment.Moment { return this._daybookDisplayManager.displayStartTime; }
  public get displayEndTime(): moment.Moment { return this._daybookDisplayManager.displayEndTime; }

  public get zoomItems(): TimelogZoomItem[] { return this._daybookDisplayManager.zoomController.zoomItems; }
  public get currentZoom(): TimelogZoomItem { return this._daybookDisplayManager.zoomController.currentZoom; }

  public get daybookSchedule(): DaybookTimeSchedule { return this._daybookSchedule; }
  public get displayManager(): DaybookDisplayManager { return this._daybookDisplayManager; }

  public onZoomChanged(zoom: TimelogZoomType) {
    this.displayManager.onZoomChanged(zoom);
    this._displayUpdated$.next(DaybookUpdateAction.REFRESH);
  }

  public changeCalendarDate$(dateYYYYMMDD: string): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    if (this.httpService.hasDateItems(dateYYYYMMDD)) {
      this._updateDisplay(dateYYYYMMDD, DaybookUpdateAction.CALENDAR);
      isComplete$.next(true);
      isComplete$.complete();
    } else {
      this.httpService.getUpdate$(dateYYYYMMDD, true).subscribe(isComplete => {
        this._updateDisplay(dateYYYYMMDD, DaybookUpdateAction.CALENDAR);
        isComplete$.next(true);
        isComplete$.complete();
      });
    }
    return isComplete$.asObservable();
  }

  public get tlefController(): TLEFController { return this.displayManager.tlefController; }
  public get timelogDisplayGrid(): TimelogDisplayGrid { return this.displayManager.timelogDisplayGrid; }


  // public get timelogDelineators(): TimelogDelineator[] { return this._daybookSchedule.scheduleDelineators; }

  public get currentlyDrawingTLE$(): Observable<TimelogEntryItem> { return this._drawTLE$.asObservable(); }
  public get currentlyDrawingTLE(): TimelogEntryItem { return this._drawTLE$.getValue(); }
  public get currentlyDrawing(): boolean { return this._currentlyDrawing; }
  // public get creatingNewTLE$(): Observable<TimelogEntryItem> { return this._createTLE$.asObservable(); }
  // public get creatingNewTLE(): TimelogEntryItem { return this._createTLE$.getValue(); }

  public clearDrawing() { this._currentlyDrawing = false; }
  public onStartDrawingTLE(drawTLE: TimelogEntryItem) { this._drawTLE$.next(drawTLE); }
  public onCreateNewDrawnTimelogEntry(drawStartDel: TimelogDelineator, drawEndDel: TimelogDelineator) {
    this._currentlyDrawing = true;
    const drawnItem: DaybookTimeScheduleActiveItem = new DaybookTimeScheduleActiveItem(drawStartDel.time, drawEndDel.time, null);
    this._updateDisplay(this.activeDateYYYYMMDD, DaybookUpdateAction.DRAWING, drawnItem);
    this.displayManager.openDrawnItem(drawStartDel.time, drawEndDel.time);
    // this.tlefController.onCreateNewDrawnTimelogEntry(drawStartDel.time, drawEndDel.time);
  }

  public setDaybookWidget(widget: DaybookWidgetType) { this._widgetChanged$.next(widget); }
  public onClickNowDelineator() { this.displayManager.onClickNowDelineator(); }
  public openTLEDelineator(delineator: TimelogDelineator) { this.tlefController.openTLEDelineator(delineator); }
  public openWakeupTime() { this.displayManager.openWakeupTime(); }
  public openFallAsleepTime() { this.displayManager.openFallAsleepTime(); }


  public reinitiate() {
    console.log('   * REINITIATING DAYBOOK DISPLAY SERVICE')
    this._daybookDisplayManager = new DaybookDisplayManager(this.toolBoxService, this.activitiesService);
    this._closedSub.unsubscribe();
    this._closedSub = this._daybookDisplayManager.closed$.subscribe(closed => {
      this._currentlyDrawing = false;
      this._updateDisplay(this.activeDateYYYYMMDD, DaybookUpdateAction.REFRESH);
    });
    this._startClock();
    this._updateDisplay(this.todayYYYYMMDD, DaybookUpdateAction.INITIAL);
  }

  public saveChanges$(action: DaybookUpdateAction): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    console.log("UPDATING ITEMS: ", this.daybookController.dayItems);
    this.httpService.updateDaybookDayItems$(this.daybookController.dayItems).subscribe(complete => {
      this._updateDisplay(this.activeDateYYYYMMDD, action);
      isComplete$.next(true);
    }, e => { isComplete$.error(e) }, () => isComplete$.next(true));
    return isComplete$.asObservable();
  }

  private _updateDisplay(dateYYYYMMDD: string, action: DaybookUpdateAction, drawnItem?: DaybookTimeScheduleActiveItem) {
    // console.log("updating display: " + dateYYYYMMDD, action)
    let doUpdate: boolean = true;
    if (action === DaybookUpdateAction.CLOCK_MINUTE && this.currentlyDrawing) {
      doUpdate = false;
    }
    if (doUpdate) {
      // console.log('******** DaybookDisplayService._updateDisplay()' + moment().format('hh:mm a'));
      this._drawTLE$.next(null);
      const dayItems: DaybookDayItem[] = this.httpService.dayItems;
      const prevDateYYYYMMDD: string = moment(dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
      const nextDateYYYYMMDD: string = moment(dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
      const controllerItems: DaybookDayItem[] = [
        dayItems.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD),
        dayItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD),
        dayItems.find(item => item.dateYYYYMMDD === nextDateYYYYMMDD),
      ];
      // console.log('   * DDS._updateDisplay() constructing controller')
      const controller: DaybookDayItemController = new DaybookDayItemController(dateYYYYMMDD, controllerItems);
      // console.log('   * DDS._updateDisplay() getting sleep cycle')
      const sleepCycle = this.sleepService.sleepManager.getSleepCycleForDate(dateYYYYMMDD, dayItems);

      const scheduleBuilder: DaybookTimeScheduleBuilder = new DaybookTimeScheduleBuilder();
      // console.log('   * DDS._updateDisplay() DaybookTimeScheduleBuilder built.  constructing schedule now.')
      const schedule: DaybookTimeSchedule = scheduleBuilder.buildDaybookSchedule(dateYYYYMMDD, controller.controllerStartTime,
        controller.controllerEndTime, sleepCycle, controller, drawnItem);

      this._daybookSchedule = schedule;
      this._daybookController = controller;
      this._daybookDisplayManager.updateDisplayManager(schedule, sleepCycle, action);

      this._displayUpdated$.next(action);
    }

  }




  private _startClock() {
    // console.log('   * DDS._startClock()')
    const msToNextMinute = moment().startOf('minute').add(1, 'minute').diff(moment(), 'milliseconds');
    let msToNextHttpUpdate = moment().startOf('minute').add(45, 'seconds').diff(moment(), 'milliseconds');
    if (msToNextHttpUpdate < 0) {
      msToNextHttpUpdate = moment().startOf('minute').add(105, 'seconds').diff(moment(), 'milliseconds');
    }
    const msToMidnight = moment().startOf('day').add(24, 'hours').add(1, 'second').diff(moment(), 'milliseconds');
    this._clock$ = new BehaviorSubject(moment());
    this._clockSubs.forEach(s => s.unsubscribe());
    this._clockSubs = [
      timer(msToNextMinute, 60000).subscribe(tick => {
        this._clock$.next(moment());
        if (this.todayYYYYMMDD === this.activeDateYYYYMMDD) {
          this._updateDisplay(this.todayYYYYMMDD, DaybookUpdateAction.CLOCK_MINUTE);
        }
      }),
      timer(msToMidnight, (1000 * 60 * 60 * 24)).subscribe(tick => {
        const newDate = moment().format('YYYY-MM-DD');
        const prevDate = moment(newDate).subtract(1, 'days').format('YYYY-MM-DD');
        if (this.activeDateYYYYMMDD === prevDate) {
          this.changeCalendarDate$(moment().format('YYYY-MM-DD'));
        }
      }),
      timer(msToNextHttpUpdate, 20000).subscribe(tick => {
        this.httpService.getUpdate$(this.activeDateYYYYMMDD);
      }),
    ];
  }


  public logout() {
    this._clockSubs.forEach(s => s.unsubscribe());
    this._todaySub.unsubscribe();
    this._closedSub.unsubscribe();

    this._daybookSchedule = null;
    this._daybookController = null;
    this._daybookDisplayManager = null;
  }

}
