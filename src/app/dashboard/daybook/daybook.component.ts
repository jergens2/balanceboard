import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import * as moment from 'moment';
import { Subscription, Observable } from 'rxjs';
import { ScreenSizeService } from '../../shared/screen-size/screen-size.service';
import { ScreenSizes } from '../../shared/screen-size/screen-sizes-enum';
import { DaybookControllerService } from './controller/daybook-controller.service';
import { DaybookWidgetType, DaybookWidget } from './widgets/daybook-widget.class';
import { DaybookDayItem } from './api/daybook-day-item.class';
import { faSpinner, faExpand } from '@fortawesome/free-solid-svg-icons';
import { DaybookController } from './controller/daybook-controller.class';
import { DaybookDisplayService } from './daybook-display.service';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit, OnDestroy {

  constructor(
    private screenScreenSizeService: ScreenSizeService, 
    private daybookDisplayService: DaybookDisplayService,
    // private daybookControllerService: DaybookControllerService
    ) { }

  private _widgets: DaybookWidget[] = [];

  private _widgetSubscriptions: Subscription[] = [];
  private _screenSize: ScreenSizes;
  private _screenSizeSubscription: Subscription = new Subscription();

  private _isLoading: boolean = true;
  

  public faSpinner = faSpinner;
  public faExpand = faExpand;


  public get widgets(): DaybookWidget[] { return this._widgets; }
  public get primaryWidget(): DaybookWidget { return this.widgets.find(w => w.isExpanded); }
  public get widgetIsCalendar(): boolean { return this.primaryWidget.type === DaybookWidgetType.CALENDAR; }
  public get widgetIsTimelog(): boolean { return this.primaryWidget.type === DaybookWidgetType.TIMELOG; }
  public get widgetIsDTL(): boolean { return this.primaryWidget.type === DaybookWidgetType.DAILY_TASK_LIST; }
  public get widgetIsSleepProfile(): boolean { return this.primaryWidget.type === DaybookWidgetType.SLEEP_PROFILE; }
  public get calendarWidget(): DaybookWidget { return this.widgets.find(w => w.type === 'CALENDAR') }
  public get timelogWidget(): DaybookWidget { return this.widgets.find(w => w.type === 'TIMELOG') }
  public get dailyTaskListWidget(): DaybookWidget { return this.widgets.find(w => w.type === 'DAILY_TASK_LIST') }
  public get sleepProfileWidget(): DaybookWidget { return this.widgets.find(w => w.type === 'SLEEP_PROFILE') }
  public get serviceIsLoading(): boolean { return this._isLoading; }


  public get daybookHeader(): string {
    return moment(this.daybookDisplayService.activeDayController.dateYYYYMMDD).format("dddd, MMM DD, YYYY");
  }

  public get appScreenSize(): ScreenSizes { return this._screenSize; }

  public get activeDayController(): DaybookController { return this.daybookDisplayService.activeDayController; }

  private _subscriptions: Subscription[] = [];

  ngOnInit() {
    const widget = this.daybookDisplayService.widgetChanged;
    this._screenSize = this.screenScreenSizeService.appScreenSize;
    this._subscriptions = [
      this.screenScreenSizeService.appScreenSize$.subscribe((changedSize) => {
        this._screenSize = changedSize;
        // console.log("Screensize changed to: " , this._screenSize)
      }),
      // this.daybookDisplayService.isLoading$.subscribe((isLoading)=>{
      //   console.log("oh shit we're loading? ", isLoading)
      //   this._isLoading = isLoading;
      // }),
      this.daybookDisplayService.widgetChanged$.subscribe((changedWidget: DaybookWidgetType) => {
        // if (changedWidget !== currentValue) {
          // currentValue = changedWidget;
          this._setPrimaryWidget(changedWidget);
        // }
      })
    ];
    this._buildWidgets();
    this._setPrimaryWidget(widget);
    this._isLoading = false;
  }

  private _buildWidgets() {
    let widgets: DaybookWidget[] = [];
    [DaybookWidgetType.CALENDAR, DaybookWidgetType.DAILY_TASK_LIST, DaybookWidgetType.SLEEP_PROFILE, DaybookWidgetType.TIMELOG].forEach((type) => {
      if (type === DaybookWidgetType.TIMELOG) {
        widgets.push(new DaybookWidget(type, true))
      } else {
        widgets.push(new DaybookWidget(type));
      }
    });
    this._widgetSubscriptions.forEach(sub => sub.unsubscribe());
    this._widgetSubscriptions = [];
    this._widgetSubscriptions = widgets.map(widget => widget.widgetSizeChanged$.subscribe((changeDirection: string) => {
      if (changeDirection === 'EXPAND') { this._setPrimaryWidget(widget.type); }
    }));
    this._widgets = widgets;
  }


  private _setPrimaryWidget(setToType: DaybookWidgetType) {
    this.widgets.forEach((widget) => {
      if (widget.type === setToType) { widget.expand(); }
      else { widget.minimize(); }
    });
  }



  ngOnDestroy() {
    this._screenSizeSubscription.unsubscribe();
    this._widgetSubscriptions.forEach(sub => sub.unsubscribe());
    this._widgetSubscriptions = [];
    this._widgets = null;
    this._subscriptions.forEach(s => s.unsubscribe());
    this.daybookDisplayService.setDaybookWidget(DaybookWidgetType.TIMELOG);
  }


}
