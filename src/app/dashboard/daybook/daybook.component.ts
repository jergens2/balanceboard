import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from '../timelog/timelog.service';
import { Subscription, timer, Subject } from 'rxjs';
import { faCalendarAlt, faCaretSquareDown, faEdit } from '@fortawesome/free-regular-svg-icons';
import { TimeSegment } from '../timelog/time-segment.model';
import { ITimeSegmentTile } from './time-segment-tile.interface';
import { faSpinner, faBars } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { HeaderService } from '../../nav/header/header.service';
import { IHeaderMenu } from '../../nav/header/header-menu/header-menu.interface';
import { NavItem } from '../..//nav/nav-item.model';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit, OnDestroy {

  constructor(private timeLogService: TimelogService, private route: ActivatedRoute, private router: Router, private headerService: HeaderService) { }

  faBars = faBars;
  faCaretSquareDown = faCaretSquareDown;
  faSpinner = faSpinner;
  faCalendar = faCalendarAlt;
  faEdit = faEdit;
  
  ifCalendarInside: boolean = false;
  ifTimeSegmentForm: boolean = false;
  ifLoading: boolean = true;


  /* bed time is the time you start trying to go to sleep */
  /* fall asleep time is the time that you are aiming to be sleeping by */
  wakeUpTomorrowTime: moment.Moment;
  bedTime: moment.Moment;
  fallAsleepTime: moment.Moment;




  daybookContentStyle: any = {};
  hourLabels: any[] = [];
  bookLines: {
    line: number,
    style: any,
    startTime: moment.Moment,
    endTime: moment.Moment
  }[] = [];

  nowLineContainerStyle: any = {};
  nowTime: moment.Moment = moment();
  nowTimeContainerStyle: any = {};
  ifNowLine: boolean = false;

  ifDaybookMenu: boolean = false;

  bedTimeStyle: any = {};
  bedTimeString: string = "";
  ifBedTime: boolean = false;

  nowSubscription: Subscription = new Subscription();
  fetchTimeSegmentsSubscription: Subscription = new Subscription();

  timeSegmentTiles: ITimeSegmentTile[] = [];
  nextTimeSegmentTile: ITimeSegmentTile = null;
  nextTimeSegment: TimeSegment = null

  reviewTimeSegment:TimeSegment = null;


  timeSegmentFormAction: string = "New";

  newTimeSegmentNavItemSubscription: Subscription = new Subscription();


  private _currentDate: moment.Moment = moment();
  private _currentDate$: Subject<moment.Moment> = new Subject();


  get currentDate(): moment.Moment {
    return this._currentDate
  }
  set currentDate(newDate) {
    this._currentDate = moment(newDate);
    this._currentDate$.next(this._currentDate);
  }


  private dayStartTime: moment.Moment = moment(this.currentDate).hour(7).minute(30).second(0).millisecond(0);
  private dayEndTime = moment(this.currentDate).hour(22).minute(30).second(0).millisecond(0);


  timeSegments: TimeSegment[] = [];

  private updateTimeSegmentSubject: Subject<TimeSegment> = new Subject();



  ngOnInit() {

    let newTimeSegmentNavItem = new NavItem("New Time Segment", "", null);
    this.newTimeSegmentNavItemSubscription = newTimeSegmentNavItem.clickEmitted.subscribe((clicked)=>{
      this.onClickNextTimeSegment();
    })

    let daybookHeaderMenuItems: NavItem[] = [];
    daybookHeaderMenuItems.push(newTimeSegmentNavItem);
    let daybookHeaderMenu: IHeaderMenu = { name:"Daybook" , isOpen: false, menuOpenSubscription: new Subscription() , menuItems: daybookHeaderMenuItems }

    this.headerService.setCurrentMenu(daybookHeaderMenu);

    this.buildDisplay(this.dayStartTime, this.dayEndTime);
    this.ifLoading = false;

    this.nowSubscription.unsubscribe();
    this.fetchTimeSegmentsSubscription.unsubscribe();

    this._currentDate$.subscribe((date) => {
      this.dayStartTime = moment(date).hour(7).minute(30).second(0).millisecond(0);
      this.dayEndTime = moment(date).hour(22).minute(30).second(0).millisecond(0);
      this.buildDisplay(this.dayStartTime, this.dayEndTime);

      this.nowSubscription.unsubscribe();
      this.nowSubscription = timer(0, 60000).subscribe(() => {
        this.fetchTimeSegmentsSubscription.unsubscribe();
        this.fetchTimeSegmentsSubscription = this.timeLogService.fetchTimeSegmentsByDay(date).subscribe((timeSegments) => {
          this.timeSegments = timeSegments;
          this.displayTimeSegments(this.timeSegments);
          this.displayNextTimeSegment();
          this.ifLoading = false;
        });
        this.buildDisplay(this.dayStartTime, this.dayEndTime);
      });
    });

    let dateRegExp: RegExp = new RegExp(/[0-9]{4}(-[0-9]{2}){2}/);
    let date: string = this.route.snapshot.paramMap.get('isoDate');
    if(dateRegExp.test(date)){
      this.currentDate = moment(date);
    }else{
      this.currentDate = moment();
    }


  }


  displayNextTimeSegment(){
    if (moment(this.currentDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      let lastEndTime = this.getLastEndTime();
      this.nextTimeSegment = new TimeSegment('NEXT_TIME_SEGMENT', '', lastEndTime, moment().toISOString(), '');
      if(moment().diff(lastEndTime, 'minutes') > 5){
        this.nextTimeSegmentTile = this.buildTimeSegmentTile(this.nextTimeSegment);
      }else{
        this.nextTimeSegmentTile = null;
      }
    }else{
      this.nextTimeSegmentTile = null;
    }
  }

  buildTimeSegmentTile(timeSegment: TimeSegment): ITimeSegmentTile {
    let tile: ITimeSegmentTile = null;
    let segmentStart: moment.Moment = moment(timeSegment.startTime);
    let segmentEnd: moment.Moment = moment(timeSegment.endTime);
    
    if(segmentStart.isSameOrAfter(this.dayEndTime) || segmentEnd.isSameOrBefore(this.dayStartTime)){
      return null;
    }
    if(segmentStart.isBefore(this.dayStartTime) && segmentEnd.isAfter(this.dayStartTime) && segmentEnd.isSameOrBefore(this.dayEndTime)){
      segmentStart = moment(this.dayStartTime);
    }
    if(segmentEnd.isAfter(this.dayEndTime) && segmentStart.isBefore(this.dayEndTime) && segmentStart.isSameOrAfter(this.dayStartTime)){
      segmentEnd = moment(this.dayEndTime);
    }

    let duration = segmentEnd.diff(segmentStart, 'minutes');
    
    
    let lineStart: {
      line: number,
      style: any,
      startTime: moment.Moment,
      endTime: moment.Moment
    } = null;
    let lineEnd: {
      line: number,
      style: any,
      startTime: moment.Moment,
      endTime: moment.Moment
    } = null;
    let gridMax: number = 1;


    for (let gridLine of this.bookLines) {
      if (moment(segmentStart).isSameOrAfter(moment(gridLine.startTime))) {
        lineStart = gridLine;
      }
      if (moment(segmentEnd).isSameOrBefore(moment(gridLine.endTime)) && moment(segmentEnd).isSameOrAfter(moment(gridLine.startTime))) {
        let index = this.bookLines.indexOf(gridLine) + 1;
        if(index > this.bookLines.length){
          index = this.bookLines.length-1;
        }
        lineEnd = this.bookLines[index];
      }

      if (gridLine.line > gridMax) {
        gridMax = gridLine.line;
      }
    }

    let containerSpan = moment(lineEnd.startTime).diff(lineStart.startTime, 'minutes');

    let percentStart = (moment(segmentStart).diff(lineStart.startTime, 'minutes') / containerSpan) * 100;
    let percentDuration = (duration / containerSpan) * 100;
    let percentEnd = 100 - (percentStart + percentDuration);

    let containerStyle = {
      "grid-row": "" + lineStart.line + " / " + lineEnd.line,
      "grid-template-rows": + percentStart + "% " + percentDuration + "% " + percentEnd + "%"
    };
    let durationStyle = {};
    if (duration < 30) {
      durationStyle = { "display": "none" };
    } else if (duration >= 30) {
      durationStyle = {};
    }
    
    tile = { timeSegment: timeSegment, containerStyle: containerStyle, durationStyle: durationStyle };
    return tile;
  }


  displayTimeSegments(timeSegments: TimeSegment[]) {
    let tiles: ITimeSegmentTile[] = [];
    for (let timeSegment of timeSegments) {
      let timeSegmentTile: ITimeSegmentTile = this.buildTimeSegmentTile(timeSegment);
      if(timeSegmentTile){
        tiles.push(timeSegmentTile);
      }
    }
    this.timeSegmentTiles = tiles;
  }

  buildDisplay(dayStartTime: moment.Moment, dayEndTime: moment.Moment) {

    if(moment().isSameOrAfter(moment(dayStartTime)) && moment().isSameOrBefore(moment(dayEndTime))){
      this.ifNowLine = true;
    }else{
      this.ifNowLine = false;
    }


    let hour: number = 0;
    hour = dayStartTime.hour();

    let currentTime = moment(dayStartTime).subtract(30, 'minutes');
    if (currentTime.minute() <= 15) {
      currentTime.minute(0);
    } else if (currentTime.minute() > 15 && currentTime.minute() <= 45) {
      currentTime.minute(30);
    } else {
      currentTime.minute(60);
    }

    let endTime = moment(dayEndTime).add(30, 'minutes');
    // let endTime = moment(this.dayEndTime);

    let hourLabels: any[] = [];
    let gridLines: {
      line: number,
      style: any,
      startTime: moment.Moment,
      endTime: moment.Moment
    }[] = [];

    let gridIndex: number = 1;

    let now = moment();
    let nowLineContainerStyle: any = {};
    let nowTimeContainerStyle: any = {};
    // let bedTimeStyle: any = {};

    function getGridTemplateRowsStyle(referenceTime: moment.Moment, currentSegmentTime: moment.Moment, rows: number): string {
      let percentage: number = 1;
      let seconds = moment(referenceTime).diff(moment(currentSegmentTime), 'seconds');


      percentage = ((seconds / (30 * 60 * rows)) * 100);
      let gridTemplateRows = "" + percentage.toFixed(0) + "% " + (100 - percentage).toFixed(0) + "%";
      return gridTemplateRows;
    }

    while (currentTime.isSameOrBefore(endTime)) {

      let segmentEnd = moment(currentTime).add(30, 'minutes');
      if (moment(now).format('YYYY-MM-DD') != moment(currentTime).format('YYYY-MM-DD')) {
        nowLineContainerStyle = { "display": "none" };
        nowTimeContainerStyle = { "display": "none" };
      } else {
        if (moment(now).isAfter(currentTime) && moment(now).isSameOrBefore(segmentEnd)) {
          nowLineContainerStyle = { "grid-row": "" + gridIndex + " / span 1", "grid-template-rows": getGridTemplateRowsStyle(now, currentTime, 1) };
          nowTimeContainerStyle = { "grid-row": "" + (gridIndex - 1) + " / span 3", "grid-column": "1 / span 2", "grid-template-rows": getGridTemplateRowsStyle(now, moment(currentTime).subtract(30, 'minutes'), 3) };
        }
      }

      // if (moment(this.bedTime).isAfter(currentTime) && moment(this.bedTime).isSameOrBefore(segmentEnd)) {
      //   bedTimeStyle = { "grid-row": "" + (gridIndex + 1) + " / -1 ", "grid-template-rows": getGridTemplateRowsStyle(this.bedTime, currentTime, 1) }
      // }


      let gridBorderBottom: string = "";
      if(moment(currentTime).minute() == 30){
        gridBorderBottom = "1px solid rgb(150, 200, 220)";
      }else{
        gridBorderBottom = "1px solid rgb(205, 230, 240)";
      }
      let gridLine = {
        line: gridIndex,
        style: { "grid-column": " 2 / span 2", "grid-row": "" + gridIndex + " / span 1", "border-bottom": gridBorderBottom },
        startTime: moment(currentTime),
        endTime: moment(currentTime).add(30, 'minutes')
      };
      gridLines.push(gridLine);

      if (currentTime.minute() != 30) {
        let hourLabel = {
          "time": currentTime.format("h a"),
          "style": { "grid-column": "1 / span 1", "grid-row": "" + gridIndex + " / span 2" }
        };
        if (gridIndex == 1) {
          hourLabel = {
            "time": '',
            "style": { "grid-column": "1 / span 2", "grid-row": "" + gridIndex + " / span 2" }
          };
        }
        hourLabels.push(hourLabel);
      }
      currentTime.add(30, 'minutes');
      gridIndex += 1;
    }

    this.daybookContentStyle = { "grid-template-rows": "repeat(" + gridIndex.toFixed(0) + ", 1fr)" }
    this.hourLabels = hourLabels;
    this.bookLines = gridLines;

    this.nowLineContainerStyle = nowLineContainerStyle;
    this.nowTimeContainerStyle = nowTimeContainerStyle;
    this.nowTime = now;


    // this.bedTimeString = this.calculateBedTimeString(now);

    // this.bedTimeStyle = bedTimeStyle;
  }


  private getLastEndTime(): string {
    if(this.timeSegments.length > 0){
      let latestTime = moment(this.timeSegments[0].endTime);
      for (let timeSegment of this.timeSegments) {
        if (moment(timeSegment.endTime).isAfter(latestTime)) {
          latestTime = moment(timeSegment.endTime);
        }
      }
      return latestTime.toISOString();
    }else{
      moment().toISOString();
    }
    
  }



  segmentBackgroundColor(timeSegment: TimeSegment): string {
    
    function hexToRGB(hex: string, alpha: number) {
      var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

      if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
      } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
      }
    }

    if (timeSegment.activities.length > 0) {
      let color = timeSegment.activities[0].activity.color;
      return hexToRGB(color, 0.5);

    } else {
      return "white";
    }
  }


  activityName(tile :ITimeSegmentTile): string{
    if (tile.timeSegment.activities.length > 0) {
      return tile.timeSegment.activities[0].activity.name;
    } else {
      return "";
    }
  }


  onClickNextTimeSegment() {
    this.timeSegmentFormAction = "New";
    this.ifTimeSegmentForm = true;
    this.ifDaybookMenu = false;
  }





  ngOnDestroy() {
    this.fetchTimeSegmentsSubscription.unsubscribe();
    this.nowSubscription.unsubscribe();
    this.newTimeSegmentNavItemSubscription.unsubscribe();
    this.headerService.setCurrentMenu(null);
  }

  onChangeCalendarDate(date: moment.Moment) {
    this.currentDate = date;
  }

  onClickHeaderDate(daysDifference: number) {
    let date = moment(this.currentDate).add(daysDifference, 'days');
    this.currentDate = date;
  }

  onClickToggleCalendar() {
    this.ifCalendarInside = !this.ifCalendarInside;
  }

  onClickDayBookMenu() {
    this.ifDaybookMenu = !this.ifDaybookMenu;
  }


  onClickTimeSegmentTile(timeSegmentTile: ITimeSegmentTile){
    this.timeSegmentFormAction = "Review";
    // this.reviewTimeSegment = new TimeSegment(timeSegmentTile.timeSegment.id, timeSegmentTile.timeSegment.userId, timeSegmentTile.timeSegment.startTimeISO, timeSegmentTile.timeSegment.endTimeISO, timeSegmentTile.timeSegment.description);
    this.reviewTimeSegment = timeSegmentTile.timeSegment;
    this.ifTimeSegmentForm = true;
    this.ifDaybookMenu = false;
  }

  onClickAddNewTimeSegment(){
    this.timeSegmentFormAction = "New";
    this.ifTimeSegmentForm = true;
    this.ifDaybookMenu = false;
  }


  onCloseForm($event: any){
    this.ifTimeSegmentForm = false;
    /*
      This is a bit of a cheater method, where instead of rebuilding the changed tile manually we just 
      reset the date to today which will fire the rebuild subscriptions in ngOnInit()
    */
    this.currentDate = moment(this.currentDate);
  }





  headerDate(daysDifference: number): string {
    let date = moment(this.currentDate).add(daysDifference, 'days');
    return date.format('MMM Do');

  }
  headerDayRelevance(daysDifference: number): string {
    let date = moment(this.currentDate).add(daysDifference, 'days');

    if (moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      return "Today";
    } else if (moment(date).format('YYYY-MM-DD') == moment().add(1, 'days').format('YYYY-MM-DD')) {
      return "Tomorrow";
    } else if (moment(date).format('YYYY-MM-DD') == moment().subtract(1, 'days').format('YYYY-MM-DD')) {
      return "Yesterday";
    } else {
      return date.format('ddd');
    }

  }

  isToday(daysDifference: number): boolean {
    let date = moment(this.currentDate).add(daysDifference, 'days');
    let isToday: boolean = false;
    if (date.format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      isToday = true;
    }
    return isToday;
  }

}
