import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from './time-log/timelog.service';
import { Subscription, Subject } from 'rxjs';
import { faCaretSquareDown, faEdit } from '@fortawesome/free-regular-svg-icons';


import { ActivatedRoute, Router} from '@angular/router';
import { HeaderService } from '../../nav/header/header.service';
import { HeaderMenu } from '../../nav/header/header-menu/header-menu.model';
import { MenuItem } from '../../nav/header/header-menu/menu-item.model';
import { ITimeSegmentFormData } from './time-segment-form/time-segment-form-data.interface';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit, OnDestroy {

  constructor(private timeLogService: TimelogService, private activatedRoute: ActivatedRoute, private router: Router, private headerService: HeaderService) { }


  faCaretSquareDown = faCaretSquareDown;

  faEdit = faEdit;
  
  ifCalendarInside: boolean = false;
  ifTimeSegmentForm: boolean = false;


  timeSegmentFormData: ITimeSegmentFormData = { action:"NEW" , timeSegment: null, date: null };

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
    let date: string = this.activatedRoute.snapshot.paramMap.get('isoDate');
    
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
      this.timeSegmentFormData = { action:"NEW" , timeSegment: null, date: this._currentDate }
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

  onTimeSegmentDataProvided(data: ITimeSegmentFormData){
    console.log("Timesegment form data RECEIVED BRAH")
    this.timeSegmentFormData = data;
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
    this.router.navigate(['/daybook/'+date.format('YYYY-MM-DD')]);
    this.changeView("timelog");
  }

  onClickToggleCalendar() {
    this.ifCalendarInside = !this.ifCalendarInside;
  }



  onCloseForm($event: any){
    this.changeView("timelog");
  }

}
