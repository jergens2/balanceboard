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

  public faSpinner = faSpinner;
  public faExpand = faExpand;

  public daybookIsLoading: boolean = true;

  public get widgets(): DaybookWidget[] { return this._widgets; }
  public get primaryWidget(): DaybookWidget { return this.widgets.find(w => w.isExpanded); }
  public get calendarWidget(): DaybookWidget { return this.widgets.find(w => w.type === 'CALENDAR') }
  public get timelogWidget(): DaybookWidget { return this.widgets.find(w => w.type === 'TIMELOG') }
  public get dailyTaskListWidget(): DaybookWidget { return this.widgets.find(w => w.type === 'DAILY_TASK_LIST') }
  public get sleepProfileWidget(): DaybookWidget { return this.widgets.find(w => w.type === 'SLEEP_PROFILE') }


  public get daybookHeader(): string {
    return moment(this.daybookDisplayService.activeDayController.dateYYYYMMDD).format("dddd, MMM DD, YYYY");
  }

  public get appScreenSize(): ScreenSizes { return this._screenSize; }

  public get activeDayController(): DaybookController { return this.daybookDisplayService.activeDayController; }

  private _dbSub: Subscription = new Subscription();

  ngOnInit() {
    this._screenSize = this.screenScreenSizeService.appScreenSize;
    this.screenScreenSizeService.appScreenSize$.subscribe((changedSize) => {
      this._screenSize = changedSize;
      // console.log("Screensize changed to: " , this._screenSize)
    });

    const now = moment();
    console.log("End of: MS", moment(now).endOf('millisecond').format('YYYY-MM-DD hh:mm a'))
    console.log("End of: second", moment(now).endOf('second').format('YYYY-MM-DD hh:mm a'))
    console.log("End of: hour", moment(now).endOf('hour').format('YYYY-MM-DD hh:mm a'))
    console.log("End of: day", moment(now).endOf('day').format('YYYY-MM-DD hh:mm a'))
    console.log("End of: week", moment(now).endOf('week').format('YYYY-MM-DD hh:mm a'))
    console.log("End of: month", moment(now).endOf('month').format('YYYY-MM-DD hh:mm a'))
    console.log("End of: year", moment(now).endOf('year').format('YYYY-MM-DD hh:mm a'))

    this.daybookDisplayService.reinitiate();


    // this._activeDay = this.daybookControllerService.activeDayController;
    // console.log("This active day is", this._activeDay)
    // this.daybookControllerService.activeDayController$.subscribe((activeDayChanged) => {
    //   if (activeDayChanged) {
    //     this._activeDay = activeDayChanged;
    //   }
    // });


    this._buildWidgets();

    this.daybookIsLoading = false;
    let currentValue: DaybookWidgetType = Object.assign({}, this.daybookDisplayService.widgetChanged);
    this._setPrimaryWidget(currentValue);

    this._dbSub = this.daybookDisplayService.widgetChanged$.subscribe((changedWidget: DaybookWidgetType) => {
      // if (changedWidget !== currentValue) {
        // currentValue = changedWidget;
        this._setPrimaryWidget(changedWidget);
      // }
    });
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
    this._dbSub.unsubscribe();
    this.daybookDisplayService.setDaybookWidget(DaybookWidgetType.TIMELOG);
  }


}
