import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Subscription, Observable } from 'rxjs';
import { AppScreenSizeService } from '../../shared/app-screen-size/app-screen-size.service';
import { AppScreenSizeLabel } from '../../shared/app-screen-size/app-screen-size-label.enum';
import { DaybookWidgetType, DaybookWidget } from './widgets/daybook-widget.class';
import { DaybookDayItem } from './daybook-day-item/daybook-day-item.class';
import { faSpinner, faExpand, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { DaybookDisplayService } from './daybook-display.service';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit, OnDestroy {

  constructor(
    private screenScreenSizeService: AppScreenSizeService,
    private daybookDisplayService: DaybookDisplayService,
    // private daybookControllerService: DaybookControllerService
  ) { }

  private _widgets: DaybookWidget[] = [];

  private _widgetSubscriptions: Subscription[] = [];
  private _screenSize: AppScreenSizeLabel;
  private _screenSizeSubscription: Subscription = new Subscription();
  private _headerDate: string;
  private _headerDiff: string;

  private _isLoading: boolean = true;
  private _mouseOverHeader: boolean = false;


  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;
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
  public get mouseOverHeader(): boolean { return this._mouseOverHeader; }

  public get headerDate(): string { return this._headerDate; }
  public get headerDaysDiff(): string { return this._headerDiff; }

  public get appScreenSize(): AppScreenSizeLabel { return this._screenSize; }
  private _subscriptions: Subscription[] = [];

  public onMouseEnterHeader() { this._mouseOverHeader = true; }
  public onMouseLeaveHeader() { this._mouseOverHeader = false; }
  public onClickDayBack() {
    const newDate: string = moment(this.daybookDisplayService.activeDateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
    this.daybookDisplayService.changeCalendarDate$(newDate);
  }
  public onClickDayForward() {
    const newDate: string = moment(this.daybookDisplayService.activeDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
    this.daybookDisplayService.changeCalendarDate$(newDate);
  }

  ngOnInit() {
    const widget = this.daybookDisplayService.widgetChanged;
    this._screenSize = this.screenScreenSizeService.appScreenSize.label;
    this._updateHeader();
    this._subscriptions = [
      this.screenScreenSizeService.appScreenSize$.subscribe((changedSize) => {
        this._screenSize = changedSize.label;
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
      }),
      this.daybookDisplayService.displayUpdated$.subscribe((update => {
        this._updateHeader();
      }))
    ];
    this._buildWidgets();
    this._setPrimaryWidget(widget);
    this._isLoading = false;
  }

  private _updateHeader() {
    const dateYYYYMMDD: string = this.daybookDisplayService.activeDateYYYYMMDD;
    this._headerDate = moment(dateYYYYMMDD).format('dddd, MMMM Do, YYYY');
    let daysDiff = moment(dateYYYYMMDD).startOf('day').diff(moment().startOf('day'), 'days');
    if (daysDiff === 0) {
      this._headerDiff = 'Today';
    } else if (daysDiff === -1) {
      this._headerDiff = 'Yesterday';
    } else if (daysDiff === 1) {
      this._headerDiff = 'Tomorrow';
    } else {
      if (daysDiff > 0) {
        this._headerDiff = daysDiff + ' days from now';
      } else if (daysDiff < 0) {
        daysDiff = Math.abs(daysDiff);
        this._headerDiff = daysDiff + ' days ago';
      }
    }
  }

  private _buildWidgets() {
    let widgets: DaybookWidget[] = [];
    [
      DaybookWidgetType.CALENDAR,
      DaybookWidgetType.DAILY_TASK_LIST,
      DaybookWidgetType.SLEEP_PROFILE,
      DaybookWidgetType.TIMELOG
    ].forEach((type) => {
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
