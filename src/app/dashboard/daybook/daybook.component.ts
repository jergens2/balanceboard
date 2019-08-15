import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { SizeService } from '../../shared/app-screen-size/size.service';
import { AppScreenSize } from '../../shared/app-screen-size/app-screen-size.enum';
import { DaybookService } from './daybook.service';
import { DaybookWidgetType, DaybookWidget } from './widgets/daybook-widget.class';
import { DaybookDayItem } from './api/daybook-day-item.class';
import { faSpinner, faExpand } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit, OnDestroy {

  constructor(private screenSizeService: SizeService, private daybookService: DaybookService){}

  public faSpinner = faSpinner;
  public faExpand = faExpand;
  private _screenSize: AppScreenSize;
  private _screenSizeSubscription: Subscription = new Subscription();
  public get appScreenSize(): AppScreenSize{
    return this._screenSize;
  }
  private _activeDay: DaybookDayItem;
  public activeDay(): DaybookDayItem{
    return this._activeDay;
  }

  public daybookIsLoading: boolean = true;

  ngOnInit() {
    this._screenSize = this.screenSizeService.appScreenSize;
    this.screenSizeService.appScreenSize$.subscribe((changedSize)=>{
      this._screenSize = changedSize;
      console.log("Screensize changed to: " , this._screenSize)
    });
    this._activeDay = this.daybookService.activeDay;
    console.log("This active day is", this._activeDay)
    this.daybookService.activeDay$.subscribe((activeDayChanged)=>{
      if(activeDayChanged){
        this._activeDay = activeDayChanged;
      }     
    });


    this.arrangeWidgets();
    this.setPrimaryWidget(DaybookWidgetType.timelog);

    this.daybookIsLoading = false;
  }


  private setPrimaryWidget(widget: DaybookWidgetType){
    if(widget == "Timelog"){
      this.timelogWidget.expand();
      this.calendarWidget.minimize();
      this.dailyTaskListWidget.minimize();
    }else if(widget == "DailyTaskList"){
      this.timelogWidget.minimize();
      this.calendarWidget.minimize();
      this.dailyTaskListWidget.expand();
    }else if(widget == "Calendar"){
      this.timelogWidget.minimize();
      this.calendarWidget.expand();
      this.dailyTaskListWidget.minimize();
    }
  }
  

  private timelogWidget: DaybookWidget;
  private calendarWidget: DaybookWidget;
  private dailyTaskListWidget: DaybookWidget;

  private widgetSubscriptions: Subscription[] = [];

  private arrangeWidgets(){
    this.timelogWidget = new DaybookWidget(DaybookWidgetType.timelog, true);
    this.calendarWidget = new DaybookWidget(DaybookWidgetType.calendar, false);
    this.dailyTaskListWidget = new DaybookWidget(DaybookWidgetType.dailyTaskList, false);

    let timelogClickSubscription: Subscription = this.timelogWidget.widgetSizeChanged$.subscribe((changeDirection: string)=>{
      if(changeDirection == "EXPAND"){
        this.setPrimaryWidget(DaybookWidgetType.timelog);
      }
    });
    let calendarClickSubscription: Subscription = this.calendarWidget.widgetSizeChanged$.subscribe((changeDirection: string)=>{
      if(changeDirection == "EXPAND"){
        this.setPrimaryWidget(DaybookWidgetType.calendar);
      }
    }); 
    let dailyTaskListClickSubscription: Subscription = this.dailyTaskListWidget.widgetSizeChanged$.subscribe((changeDirection: string)=>{
      if(changeDirection == "EXPAND"){
        this.setPrimaryWidget(DaybookWidgetType.dailyTaskList);
      }
    }); 

    this.widgetSubscriptions = [timelogClickSubscription, calendarClickSubscription, dailyTaskListClickSubscription];
  }
  
  

  private _timelogContainerClasses: any = {};
  public get timelogContainerClasses(): any{
    return this._timelogContainerClasses;
  }
  private _calendarContainerClasses: any = {};
  public get calendarContainerClasses(): any{
    return this._calendarContainerClasses;
  }
  private _dailyTaskListContainerClasses: any = {};
  public get dailyTaskListContainerClasses(): any{
    return this._dailyTaskListContainerClasses;
  }
  private _activityDataContainerClasses: any = {};
  public get activityDataContainerClasses(): any{
    return this._activityDataContainerClasses;
  }




  public get daybookHeader(): string{
    return moment(this.daybookService.activeDayYYYYMMDD).format("dddd, MMM DD, YYYY");
  }

  ngOnDestroy(){
    this._screenSizeSubscription.unsubscribe();
    this.widgetSubscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
    this.widgetSubscriptions = [];
    this.timelogWidget = null;
    this.calendarWidget = null;
    this.dailyTaskListWidget = null;
  }


}
