import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimelogZoomControllerItem } from './widgets/timelog/timelog-large/timelog-zoom-controller/timelog-zoom-controller-item.class';
import { DaybookControllerService } from './controller/daybook-controller.service';
import { DaybookController } from './controller/daybook-controller.class';
import { DaybookWidgetType } from './widgets/daybook-widget.class';
import { TimelogZoomType } from './widgets/timelog/timelog-large/timelog-zoom-controller/timelog-zoom-type.enum';
import * as moment from 'moment';
import { DaybookAvailabilityType } from './controller/items/daybook-availability-type.enum';
import { TimeUtilities } from '../../shared/utilities/time-utilities/time-utilities';

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

  public get dateYYYYMMDD(): string { return this.daybookControllerService.activeDayController.dateYYYYMMDD; }
  public get activeDayController(): DaybookController { return this.daybookControllerService.activeDayController; }
  public get activeDayController$(): Observable<DaybookController> { return this.daybookControllerService.activeDayController$; }
  public get clock(): moment.Moment { return this.daybookControllerService.clock; }


  public get widgetChanged$(): Observable<DaybookWidgetType> { return this._widgetChanged$.asObservable(); }
  public get widgetChanged(): DaybookWidgetType { return this._widgetChanged$.getValue(); }
  public get displayUpdated$(): Observable<boolean> { return this._displayUpdated$.asObservable(); }

  public get displayStartTime(): moment.Moment { return this._displayStartTime; }
  public get displayEndTime(): moment.Moment { return this._displayEndTime; }

  public get zoomItems(): TimelogZoomControllerItem[] { return this._zoomItems; }

  public setDaybookWidget(widget: DaybookWidgetType) { this._widgetChanged$.next(widget); }


  public onZoomChanged(newZoomValue: TimelogZoomControllerItem) {
    console.log("to do:  set a new zoom level")
    this._updateDisplay();
  }


  public initiate() {
    this._buildZoomItems();
    this._buildDisplayOutputItems();

    this.activeDayController$.subscribe((activeDayChanged) => {
      console.log("DaybookDisplayService: ActiveController updated.  Updating display.")
      this._updateDisplay();
    });
    this._updateDisplay();
  }

  private _updateDisplay(){
    console.log("   DaybookDisplayService:  Display updated.  ")
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

}
