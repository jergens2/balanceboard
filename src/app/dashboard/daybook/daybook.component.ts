import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from './time-log/timelog.service';
import { Subscription, timer, Subject } from 'rxjs';
import { faCaretSquareDown, faEdit } from '@fortawesome/free-regular-svg-icons';
import { TimeSegment } from './time-log/time-segment.model';
import { ITimeSegmentTile } from './time-log/time-segment-tile.interface';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { HeaderService } from '../../nav/header/header.service';
import { HeaderMenu } from '../../nav/header/header-menu/header-menu.model';
import { MenuItem } from '../../nav/header/header-menu/menu-item.model';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit, OnDestroy {

  constructor(private timeLogService: TimelogService, private route: ActivatedRoute, private router: Router, private headerService: HeaderService) { }


  faCaretSquareDown = faCaretSquareDown;

  faEdit = faEdit;
  
  ifCalendarInside: boolean = false;
  ifTimeSegmentForm: boolean = false;


  timeSegmentFormAction: string = "New";

  private headerMenuSubscriptions: Subscription[] = [];


  private _currentDate: moment.Moment = moment();
  private _currentDate$: Subject<moment.Moment> = new Subject();


  get currentDate(): moment.Moment {
    return this._currentDate
  }
  set currentDate(newDate) {
    this._currentDate = moment(newDate);
    this._currentDate$.next(this._currentDate);
  }

  currentView: string = "timelog"; 

  ngOnInit() {

    this.buildHeaderMenu();
    let dateRegExp: RegExp = new RegExp(/[0-9]{4}(-[0-9]{2}){2}/);
    let date: string = this.route.snapshot.paramMap.get('isoDate');
    if(dateRegExp.test(date)){
      this.currentDate = moment(date);
    }else{
      this.currentDate = moment();
    }
  }

  private buildHeaderMenu(){
    let daybookHeaderMenuItems: MenuItem[] = [];

    let newTimeSegmentMenuItem = new MenuItem("New Time Segment", null, null);
    this.headerMenuSubscriptions.push(newTimeSegmentMenuItem.clickEmitted$.subscribe((clicked)=>{
      this.currentView = "form";
    }));

    let timelogViewMenuItem = new MenuItem("Time Log View", null, null);
    this.headerMenuSubscriptions.push(timelogViewMenuItem.clickEmitted$.subscribe((clicked)=>{
      this.changeView("timelog");
    }));

    let heatmapViewMenuItem = new MenuItem("Heat Map View", null, null);
    this.headerMenuSubscriptions.push(heatmapViewMenuItem.clickEmitted$.subscribe((clicked)=>{
      this.changeView("heatmap");
    }));

    daybookHeaderMenuItems.push(newTimeSegmentMenuItem);
    daybookHeaderMenuItems.push(timelogViewMenuItem);
    daybookHeaderMenuItems.push(heatmapViewMenuItem);    
    
    let daybookHeaderMenu: HeaderMenu = new HeaderMenu('Daybook', daybookHeaderMenuItems);

    this.headerService.setCurrentMenu(daybookHeaderMenu);
  }

  private changeView(newView: string){
    this.currentView = newView;
  }

  reviewTimeSegment: TimeSegment = null;
  onTimeSegmentClicked(timeSegmentTile: ITimeSegmentTile){
    this.reviewTimeSegment = timeSegmentTile.timeSegment;
    this.timeSegmentFormAction = "Review";
    this.changeView("form");
  }

  newTimeSegment: TimeSegment = null;
  onNextTimeSegmentClicked(timeSegment: TimeSegment){
    console.log("onNextTimeSegmentClicked, ", timeSegment)
    this.newTimeSegment = timeSegment;
    this.timeSegmentFormAction = "New";
    this.changeView("form");
  }

  ngOnDestroy() {
    this.headerMenuSubscriptions.forEach((sub: Subscription)=>{
      sub.unsubscribe();
    });
    this.headerService.setCurrentMenu(null);
  }

  onChangeCalendarDate(date: moment.Moment) {
    this.currentDate = date;
  }

  onClickToggleCalendar() {
    this.ifCalendarInside = !this.ifCalendarInside;
  }

  ifDaybookMenu: boolean = false;
  onClickDayBookMenu() {
    this.ifDaybookMenu = !this.ifDaybookMenu;
  }

  onClickAddNewTimeSegment(){
    this.timeSegmentFormAction = "New";
    this.ifTimeSegmentForm = true;
    this.ifDaybookMenu = false;
  }


  onCloseForm($event: any){
    /*
      This is a bit of a cheater method, where instead of rebuilding the changed tile manually we just 
      reset the date to today which will fire the rebuild subscriptions in ngOnInit()
    */
    this.currentDate = moment(this.currentDate);
    this.changeView("timelog");
  }

}
