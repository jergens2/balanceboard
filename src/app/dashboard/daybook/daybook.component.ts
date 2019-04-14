import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from './time-log/timelog.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { faCaretSquareDown, faEdit } from '@fortawesome/free-regular-svg-icons';


import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../../nav/header/header.service';
import { HeaderMenu } from '../../nav/header/header-menu/header-menu.model';
import { MenuItem } from '../../nav/header/header-menu/menu-item.model';
import { ITimeSegmentFormData } from './time-segment-form/time-segment-form-data.interface';
import { Day } from './day.model';
import { DaybookService } from './daybook.service';
import { Objective } from './objectives/objective.model';
import { ObjectivesService } from './objectives/objectives.service';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit, OnDestroy {

  constructor(
    private timeLogService: TimelogService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private daybookService: DaybookService,
    private objectivesService: ObjectivesService,
    private headerService: HeaderService) { }


  faCaretSquareDown = faCaretSquareDown;

  faEdit = faEdit;

  ifCalendarInside: boolean = false;
  ifTimeSegmentForm: boolean = false;


  timeSegmentFormData: ITimeSegmentFormData = { action: "NEW", timeSegment: null, date: null };

  private _headerMenuSubscriptions: Subscription[] = [];
  private _currentDaySubscription: Subscription = new Subscription();

  private _currentDate: moment.Moment = moment();
  // private _currentDate$: Subject<moment.Moment> = new Subject();


  get currentDate(): moment.Moment {
    return this._currentDate
  }
  public setCurrentDate(newDate) {
    this.daybookService.setDate(newDate);
    // this._currentDate = moment(newDate);
    // this._currentDate$.next(this._currentDate);
  }

  currentView: string = "timelog";

  day: Day = null;

  ngOnInit() {

    this.day = this.daybookService.currentDay;
    this._currentDate = moment(this.day.date);
    // this._currentDate$.next(this._currentDate);

    this._currentDaySubscription.unsubscribe();
    this._currentDaySubscription = this.daybookService.currentDay$.subscribe((changedDay: Day)=>{
      console.log("daybook subscription:  day changed", changedDay.date.format('YYYY-MM-DD'));
      this.day = changedDay;
      this._currentDate = moment(this.day.date);
      // this._currentDate$.next(this._currentDate);
    })


    this.buildHeaderMenu();
    let dateRegExp: RegExp = new RegExp(/[0-9]{4}(-[0-9]{2}){2}/);
    let date: string = this.activatedRoute.snapshot.paramMap.get('isoDate');

    if (dateRegExp.test(date)) {
      this.setCurrentDate(moment(date));
    } else {
      /*
        is this block necessary, given the fact that the auth service logs in to the daybook service and sets the initial date as moment() ?
      */
      // this.setCurrentDate(moment());
    }

  }

  private buildHeaderMenu() {
    let daybookHeaderMenuItems: MenuItem[] = [];

    let newTimeSegmentMenuItem = new MenuItem("New Time Segment", null, null);
    this._headerMenuSubscriptions.push(newTimeSegmentMenuItem.clickEmitted$.subscribe((clicked) => {
      this.timeSegmentFormData = { action: "NEW", timeSegment: null, date: this._currentDate }
      this.currentView = "form";
    }));

    let timelogViewMenuItem = new MenuItem("Time Log View", null, null);
    this._headerMenuSubscriptions.push(timelogViewMenuItem.clickEmitted$.subscribe((clicked) => {
      this.changeView("timelog");
    }));

    let heatmapViewMenuItem = new MenuItem("Heat Map View", null, null);
    this._headerMenuSubscriptions.push(heatmapViewMenuItem.clickEmitted$.subscribe((clicked) => {
      this.changeView("heatmap");
    }));

    daybookHeaderMenuItems.push(newTimeSegmentMenuItem);
    daybookHeaderMenuItems.push(timelogViewMenuItem);
    daybookHeaderMenuItems.push(heatmapViewMenuItem);

    let daybookHeaderMenu: HeaderMenu = new HeaderMenu('Daybook', daybookHeaderMenuItems);

    this.headerService.setCurrentMenu(daybookHeaderMenu);
  }

  private changeView(newView: string) {
    this.currentView = newView;
  }

  onTimeSegmentDataProvided(data: ITimeSegmentFormData) {
    console.log("Timesegment form data RECEIVED BRAH")
    this.timeSegmentFormData = data;
    this.changeView("form");
  }


  ngOnDestroy() {
    this._headerMenuSubscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
    this._currentDaySubscription.unsubscribe();
    this.headerService.setCurrentMenu(null);
  }

  onChangeDate(date: moment.Moment) {
    this.setCurrentDate(moment(date));
    this.router.navigate(['/daybook/' + date.format('YYYY-MM-DD')]);
    this.changeView("timelog");
  }

  onClickToggleCalendar() {
    this.ifCalendarInside = !this.ifCalendarInside;
  }



  onCloseForm($event: any) {
    this.changeView("timelog");
  }

}
