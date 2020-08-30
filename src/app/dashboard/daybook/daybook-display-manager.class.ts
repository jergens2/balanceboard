import { DaybookTimeSchedule } from './api/daybook-time-schedule/daybook-time-schedule.class';
import * as moment from 'moment';
import { TLEFController } from './widgets/timelog/timelog-entry-form/TLEF-controller.class';
import { TimelogDisplayGrid } from './widgets/timelog/timelog-display-grid-class';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { TimelogZoomController } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-controller.class';
import { SleepCycleScheduleItemsBuilder } from './sleep-manager/sleep-cycle/sleep-cycle-schedule-items-builder.class';
import { DaybookTimeScheduleItem } from './api/daybook-time-schedule/daybook-time-schedule-item.class';
import { TimelogZoomType } from './widgets/timelog/timelog-large-frame/timelog-zoom-controller/timelog-zoom-type.enum';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { ActivityHttpService } from '../activities/api/activity-http.service';
import { TimelogDelineator } from './widgets/timelog/timelog-delineator.class';

export class DaybookDisplayManager {
    /**
     *  This class is responsible managing everything related to the display of daybook
     *
     *  Key components of the Daybook, including:
     *  -TimeSelectionColumn component,
     *  -TimelogBody component / (TimelogDisplayGrid)
     *  -Timelog Entry Form Controller, AKA TLEF component / TLEF controller
     *
     *
     *  This class has a DaybookTimeScheduleProperty which it receives from DaybookDisplayService
     *  This class is a property of DaybookDisplayService
     *
     *  All daybook and timelog components that need to coordinate with the current display
     *  will access this class through the DaybookDisplayService
     */
    constructor(toolboxService: ToolboxService, activityService: ActivityHttpService) { }

    private _tlefController: TLEFController;
    private _timelogDisplayGrid: TimelogDisplayGrid;
    private _schedule: DaybookTimeSchedule;
    private _sleepCycle: SleepCycleScheduleItemsBuilder;
    private _toolboxService: ToolboxService;
    private _activityService: ActivityHttpService;

    private _zoomController: TimelogZoomController;

    private _displayItems: DaybookTimeScheduleItem[] = [];
    private _currentlyOpenDisplayItem$: BehaviorSubject<DaybookTimeScheduleItem> = new BehaviorSubject(null);

    public get tlefController(): TLEFController { return this._tlefController; }
    public get timelogDisplayGrid(): TimelogDisplayGrid { return this._timelogDisplayGrid; }

    public get displayEndTime(): moment.Moment { return this._zoomController.displayStartTime; }
    public get displayStartTime(): moment.Moment { return this._zoomController.displayEndTime; }
    public get wakeupTime(): moment.Moment { return this._sleepCycle.previousWakeupTime; }
    public get fallAsleepTime(): moment.Moment { return this._sleepCycle.nextFallAsleepTime; }
    public get displayDurationMs(): number { return this._zoomController.displayDurationMs; }
    public get zoomController(): TimelogZoomController { return this._zoomController; }

    public get currentlyOpenDisplayItem(): DaybookTimeScheduleItem { return this._currentlyOpenDisplayItem$.getValue(); }
    public get currentlyOpenDisplayItem$(): Observable<DaybookTimeScheduleItem> { return this._currentlyOpenDisplayItem$.asObservable(); }

    public updateDisplayManager(timeSched: DaybookTimeSchedule, sleepCycle: SleepCycleScheduleItemsBuilder) {
        this._schedule = timeSched;
        this._sleepCycle = sleepCycle;
        if (!this._zoomController) {
            this._zoomController = new TimelogZoomController(timeSched, sleepCycle);
        } else {
            this._zoomController.update(timeSched, sleepCycle);
        }
        this._displayItems = this._schedule.getItemsInRange(this.displayStartTime, this.displayEndTime);
        this._displayItems.forEach(di => di.setDisplayPercent(this.displayDurationMs));
        this._updateTimelogDisplayGrid();
        this._updateTlefController();
    }
    public onZoomChanged(zoom: TimelogZoomType) {
        this._zoomController.setZoom(zoom);
        this._displayItems = this._schedule.getItemsInRange(this.displayStartTime, this.displayEndTime);
    }

    public getDelineators(): TimelogDelineator[] {
        const delineators: TimelogDelineator[] = [];
        this._displayItems.forEach(displayItem => {
            delineators.push(displayItem.startDelineator);
            delineators.push(displayItem.endDelineator);
        });
        return delineators.sort((d1, d2) => {
            if (d1.time.isBefore(d2.time)) {
                return -1;
            } else if (d1.time.isAfter(d2.time)) {
                return 1;
            }
            return 0;
        });
    }


    private _updateTimelogDisplayGrid() {
        if (!this._timelogDisplayGrid) {
            this._timelogDisplayGrid = new TimelogDisplayGrid(this._displayItems);
        } else {
            this._timelogDisplayGrid.update(this._displayItems);
        }
    }
    private _updateTlefController() {
        if (!this._tlefController) {
            this._tlefController = new TLEFController(this._displayItems, this._activityService.activityTree);
        } else {
            this._tlefController.update();
        }
    }

    // private _tlefSubscriptions: Subscription[] = [];
    // private _updateTLEFSubscriptions() {
    // this._tlefSubscriptions.forEach(s => s.unsubscribe());
    // this._tlefSubscriptions = [
    //   this.tlefController.onFormClosed$.subscribe((formIsClosed: boolean) => {
    //     if (formIsClosed) {
    //       this._updateDisplay({
    //         type: DaybookDisplayUpdateType.DEFAULT,
    //         controller: this.daybookControllerService.activeDayController, 
    //       });
    //     }
    //   }),
    //   this.tlefController.currentlyOpenTLEFItem$.subscribe((tlefItem) => {
    //     if (tlefItem) {
    //       this.timelogDisplayGrid.updateActiveItem(tlefItem);
    //     }
    //   })
    // ];
    // }
}
