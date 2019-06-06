import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { faCaretSquareDown, faEdit } from '@fortawesome/free-regular-svg-icons';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../../nav/header/header.service';
import { HeaderMenu } from '../../nav/header/header-menu/header-menu.model';
import { MenuItem } from '../../nav/header/header-menu/menu-item.model';

import { DayDataService } from '../../shared/document-definitions/day-data/day-data.service';
import { DayData } from '../../shared/document-definitions/day-data/day-data.class';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DayDataComponent implements OnInit, OnDestroy {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dayDataService: DayDataService,
    private headerService: HeaderService) { }


  faCaretSquareDown = faCaretSquareDown;

  faEdit = faEdit;

  ifCalendarInside: boolean = false;




  private _headerMenuSubscriptions: Subscription[] = [];
  private _currentDaySubscription: Subscription = new Subscription();

  private _currentDate: moment.Moment = moment();
  // private _currentDate$: Subject<moment.Moment> = new Subject();


  get currentDate(): moment.Moment {
    return this._currentDate
  }
  public setCurrentDate(newDate) {
    this.dayDataService.setDate(newDate);
    // this._currentDate = moment(newDate);
    // this._currentDate$.next(this._currentDate);
  }

  currentView: string = "timelog";

  dayData: DayData = null;

  ngOnInit() {

    this.dayData = this.dayDataService.currentDay;
    // this._currentDate = moment(this.dayData.date);
    // this._currentDate$.next(this._currentDate);
    this._currentDate = moment();

    this._currentDaySubscription.unsubscribe();
    // this._currentDaySubscription = this.dayDataService.currentDay$.subscribe((changedDay: DayData)=>{
    //   console.log("daybook subscription:  DayData changed", changedDay.date.format('YYYY-MM-DD'));
    //   this.dayData = changedDay;
    //   this._currentDate = moment(this.dayData.date);
    //   // this._currentDate$.next(this._currentDate);
    // })


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
    // let daybookHeaderMenuItems: MenuItem[] = [];


    // let timelogViewMenuItem = new MenuItem("Time Log View", null, null);
    // this._headerMenuSubscriptions.push(timelogViewMenuItem.clickEmitted$.subscribe((clicked) => {
    //   this.changeView("timelog");
    // }));

    // let heatmapViewMenuItem = new MenuItem("Heat Map View", null, null);
    // this._headerMenuSubscriptions.push(heatmapViewMenuItem.clickEmitted$.subscribe((clicked) => {
    //   this.changeView("heatmap");
    // }));

    // daybookHeaderMenuItems.push(newTimelogEntryMenuItem);
    // daybookHeaderMenuItems.push(timelogViewMenuItem);
    // daybookHeaderMenuItems.push(heatmapViewMenuItem);

    // let daybookHeaderMenu: HeaderMenu = new HeaderMenu('DayData', daybookHeaderMenuItems);

    // this.headerService.setCurrentMenu(daybookHeaderMenu);
  }

  private changeView(newView: string) {
    this.currentView = newView;
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



}
