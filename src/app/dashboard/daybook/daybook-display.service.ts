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

@Injectable({
  providedIn: 'root'
})
export class DaybookDisplayService {

  constructor(private daybookControllerService: DaybookControllerService) { }

  private _widgetChanged$: BehaviorSubject<DaybookWidgetType> = new BehaviorSubject(DaybookWidgetType.TIMELOG);
  private _displayUpdated$: Subject<boolean> = new Subject();

  private _zoomItems: TimelogZoomControllerItem[] = [];
  private _displayStartTime: moment.Moment;
  private _displayEndTime: moment.Moment;

  private _timeDelineators: TimelogDelineator[] = [];
  private _timelogDisplayGrid: TimelogDisplayGrid;

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

  public get timelogDisplayGrid(): TimelogDisplayGrid { return this._timelogDisplayGrid; }
  public get timelogDelineators(): TimelogDelineator[] { return this._timeDelineators; }

  public get zoomItems(): TimelogZoomControllerItem[] { return this._zoomItems; }

  public setDaybookWidget(widget: DaybookWidgetType) { 
    this._widgetChanged$.next(widget); 
  }

  

  public onZoomChanged(newZoomValue: TimelogZoomControllerItem) {
    // console.log("to do:  set a new zoom level")
    this._updateDisplay();
  }


  public initiate() {


    this.activeDayController$.subscribe((activeDayChanged) => {
      // console.log("DaybookDisplayService: ActiveController updated.  Updating display.")
      this._updateDisplay();
    });
    this._updateDisplay();
  }

  private _updateDisplay(){
    // console.log(" Updating display")
    this._buildZoomItems();
    this._buildDisplayOutputItems();
    // this._setDefaultDayStructureTimes();
    this._loadTimelogDelineators();
    let newGrid: TimelogDisplayGrid = new TimelogDisplayGrid(this.displayStartTime, this.displayEndTime, this._timeDelineators, this.activeDayController);
    this._timelogDisplayGrid = newGrid;

    this._displayUpdated$.next(true);
  }

  private _buildDisplayOutputItems() {

  }

  private _buildZoomItems() {
    if(this._zoomItems.length > 0){
      //re-set the existing zoom level
    }else{

    }
    let zoomItems: TimelogZoomControllerItem[] = [];
    let startTime = moment(this.daybookControllerService.activeDayController.wakeupTime);
    let endTime = moment(this.daybookControllerService.activeDayController.fallAsleepTime);
    let wakeItem = new TimelogZoomControllerItem(startTime, endTime, TimelogZoomType.AWAKE);
    zoomItems.push(wakeItem);

    this._zoomItems = zoomItems;

    this._displayStartTime = TimeUtilities.roundDownToFloor(moment(startTime).subtract(15, 'minutes'), 30 );
    this._displayEndTime = TimeUtilities.roundUpToCeiling(moment(endTime).add(15, 'minutes'), 30 );
  }



  private _loadTimelogDelineators() {
    const timelogDelineators: TimelogDelineator[] = [];
    const frameStartDelineator = new TimelogDelineator(this.displayStartTime, TimelogDelineatorType.FRAME_START);
    const fameEndDelineator = new TimelogDelineator(this.displayEndTime, TimelogDelineatorType.FRAME_END);
    const wakeupDelineator = new TimelogDelineator(this.wakeupTime, TimelogDelineatorType.WAKEUP_TIME);
    const fallAsleepDelineator = new TimelogDelineator(this.fallAsleepTime, TimelogDelineatorType.FALLASLEEP_TIME);
    timelogDelineators.push(frameStartDelineator);
    timelogDelineators.push(wakeupDelineator);
    timelogDelineators.push(fallAsleepDelineator);
    timelogDelineators.push(fameEndDelineator);
    if (this.activeDayController.isToday) {
      const nowTime = moment();
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
    if(sortedDelineators.length > 0){
      for (let i = 1; i < sortedDelineators.length; i++){
        if(sortedDelineators[i].time.isSame(sortedDelineators[i-1].time)){
          const thisPriorityIndex = priority.indexOf(sortedDelineators[i].delineatorType);
          const prevPriorityIndex = priority.indexOf(sortedDelineators[i-1].delineatorType);
          // lower priority index is higher priority
          if(thisPriorityIndex < prevPriorityIndex){
            sortedDelineators.splice(i-1,1);
            i--;
          }else if(thisPriorityIndex > prevPriorityIndex){
            sortedDelineators.splice(i, 1);
            i--;
          }else{
            console.log('Same? ' , priority[thisPriorityIndex], priority[prevPriorityIndex])
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
