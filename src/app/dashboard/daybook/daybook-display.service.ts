import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { TimelogZoomItem } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-item.class';
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
import { DaybookDisplayUpdateType } from './api/daybook-display-update.interface';
import { ActivityHttpService } from '../activities/api/activity-http.service';
import { SleepService } from './sleep-manager/sleep.service';
import { SleepManager } from './sleep-manager/sleep-manager.class';
import { DaybookTimeSchedule } from './api/daybook-time-schedule/daybook-time-schedule.class';
import { ActivityTree } from '../activities/api/activity-tree.class';
import { DaybookDayItemController } from './api/daybook-day-item-controller';
import { DaybookDayItem } from './api/daybook-day-item.class';
import { DaybookHttpService } from './api/daybook-http.service';
import { DaybookDisplayManager } from './daybook-display-manager.class';
import { DaybookTimeScheduleBuilder } from './api/daybook-time-schedule/daybook-time-schedule-builder.class';

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

  private _zoomItems: TimelogZoomItem[] = [];
  private _clock$: BehaviorSubject<moment.Moment>;

  // prepare to kill this property
  private _daybookSchedule: DaybookTimeSchedule;
  private _daybookController: DaybookDayItemController;
  private _daybookDisplayManager: DaybookDisplayManager;



  private _drawTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
  private _createTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);

  private _subs: Subscription[] = [];

  public get dateYYYYMMDD(): string { return this.clock.format('YYYY-MM-DD'); }
  public get clock(): moment.Moment { return this._clock$.getValue(); }
  public get clock$(): Observable<moment.Moment> { return this._clock$.asObservable(); }
  public get daybookController(): DaybookDayItemController { return this._daybookController; }
  public get widgetChanged$(): Observable<DaybookWidgetType> { return this._widgetChanged$.asObservable(); }
  public get widgetChanged(): DaybookWidgetType { return this._widgetChanged$.getValue(); }

  public get displayStartTime(): moment.Moment { return this._daybookDisplayManager.displayStartTime; }
  public get displayEndTime(): moment.Moment { return this._daybookDisplayManager.displayEndTime; }

  public get zoomItems(): TimelogZoomItem[] { return this._zoomItems; }
  public get currentZoom(): TimelogZoomItem { return this._daybookDisplayManager.zoomController.currentZoom; }

  public get daybookSchedule(): DaybookTimeSchedule { return this._daybookSchedule; }
  public get displayManager(): DaybookDisplayManager { return this._daybookDisplayManager; }
  public onZoomChanged(zoom: TimelogZoomType) { this.displayManager.onZoomChanged(zoom); }

  public changeCalendarDate$(dateYYYYMMDD: string): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    if (this.httpService.hasDateItems(dateYYYYMMDD)) {
      this._updateDisplay(dateYYYYMMDD);
      isComplete$.next(true);
      isComplete$.complete();
    } else {
      this.httpService.getUpdate$(dateYYYYMMDD).subscribe(isComplete => {
        this._updateDisplay(dateYYYYMMDD);
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
  public get creatingNewTLE$(): Observable<TimelogEntryItem> { return this._createTLE$.asObservable(); }
  public get creatingNewTLE(): TimelogEntryItem { return this._createTLE$.getValue(); }


  public onStartDrawingTLE(drawTLE: TimelogEntryItem) { this._drawTLE$.next(drawTLE); }
  public onCreateNewTimelogEntry(drawStartDel: TimelogDelineator, drawEndDel: TimelogDelineator) {

    this.daybookSchedule.onCreateNewTimelogEntry(drawStartDel, drawEndDel);
    this.tlefController.onCreateNewTimelogEntry(this.daybookSchedule);
    // this.timelogDisplayGrid.update(this.daybookSchedule);
  }

  public setDaybookWidget(widget: DaybookWidgetType) { this._widgetChanged$.next(widget); }
  public openNewCurrentTimelogEntry() { this.tlefController.openNewCurrentTimelogEntry(); }
  public openTimelogGridItem(gridItem: TimelogDisplayGridItem) { this.tlefController.openTimelogGridItem(gridItem); }
  public openTLEDelineator(delineator: TimelogDelineator) { this.tlefController.openTLEDelineator(delineator); }
  public openWakeupTime() { this.tlefController.openWakeupTime(); }
  public openFallAsleepTime() { this.tlefController.openFallAsleepTime(); }



  public reinitiate() {
    console.log("REINITIATING DAYBOOK DISPLAY SERVICE")
    console.log(" Going to reubild the Daybook Manager now.")
    this._daybookDisplayManager = new DaybookDisplayManager(this.toolBoxService, this.activitiesService);
    this._startClock();
    this._updateDisplay(this.dateYYYYMMDD);
  }

  /**
   *  
   */
  private _updateDisplay(dateYYYYMMDD: string) {
    const dayItems: DaybookDayItem[] = this.httpService.dayItems;
    console.log("DAY ITEMS FROM HTTP: " , dayItems)
    const prevDateYYYYMMDD: string = moment(dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
    const nextDateYYYYMMDD: string = moment(dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
    const controllerItems: DaybookDayItem[] = dayItems.filter(d => {
      return d.dateYYYYMMDD >= prevDateYYYYMMDD && d.dateYYYYMMDD <= nextDateYYYYMMDD;
    });
    const controller: DaybookDayItemController = new DaybookDayItemController(dateYYYYMMDD, controllerItems);
    const sleepCycle = this.sleepService.sleepManager.getSleepCycleForDate(dateYYYYMMDD, dayItems);

    const scheduleBuilder: DaybookTimeScheduleBuilder = new DaybookTimeScheduleBuilder();
    const schedule: DaybookTimeSchedule = scheduleBuilder.buildDaybookSchedule(dateYYYYMMDD, controller.controllerStartTime,
      controller.controllerEndTime, sleepCycle, controller);
    this._daybookDisplayManager.updateDisplayManager(schedule, sleepCycle);
  }

  // private _performClockUpdate() {
  //   // this._updateDisplay(this.dateYYYYMMDD);
  //   // to do:  deal with crossing of midnight.
  //   // if it is crossed midnight, but the sleep position is still awake after midnight, then don't change the date yet.
  //   this._daybookDisplayManager.performClockUpdate();
  // }

  private _clockSubs: Subscription[] = [];

  private _startClock() {
    const msToNextMinute = moment().startOf('minute').add(1, 'minute').diff(moment(), 'milliseconds');
    let msToNextHttpUpdate = moment().startOf('minute').add(45, 'seconds').diff(moment(), 'milliseconds');
    if (msToNextHttpUpdate < 0) {
      msToNextHttpUpdate = moment().startOf('minute').add(105, 'seconds').diff(moment(), 'milliseconds');
    }
    this._clock$ = new BehaviorSubject(moment());
    this._clockSubs = [
      timer(msToNextMinute, 60000).subscribe(tick => {
        this._clock$.next(moment());
        this._updateDisplay(this.dateYYYYMMDD);
      }),
      timer(msToNextHttpUpdate, 60000).subscribe(tick => this.httpService.getUpdate$(this.dateYYYYMMDD)),
    ];
    const todayYYYYMMDD: string = moment().format('YYYY-MM-DD');
  }

  public logout() {
    this._clockSubs.forEach(s => s.unsubscribe());
    console.log("to do:  kill other things")
  }

}
