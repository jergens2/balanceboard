import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { Subscription, timer, Subject } from 'rxjs';
import { ITimeSegmentTile } from './time-segment-tile.interface';
import { TimeSegment } from './time-segment.model';
import { TimelogService } from './timelog.service';
import { faSpinner, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { ITimeWindow } from './time-window.interface';

@Component({
  selector: 'app-time-log',
  templateUrl: './time-log.component.html',
  styleUrls: ['./time-log.component.css']
})
export class TimeLogComponent implements OnInit, OnDestroy {

  constructor(private timelogService: TimelogService) { }

  faSpinner = faSpinner;
  faCaretUp = faCaretUp;
  faCaretDown = faCaretDown;

  nowLineContainerStyle: any = {};
  nowTime: moment.Moment = moment();
  nowTimeContainerStyle: any = {};
  ifNowLine: boolean = false;


  ifLoading: boolean = false;

  private _nowSubscription: Subscription = new Subscription();
  private _fetchTimeSegmentsSubscription: Subscription = new Subscription();

  timeSegmentTiles: ITimeSegmentTile[] = [];
  nextTimeSegmentTile: ITimeSegmentTile = null;
  nextTimeSegment: TimeSegment = null

  timeSegments: TimeSegment[] = [];

  timelogViewStyle: any = {};
  hourLabels: { hour: string, style: any }[] = [];
  hourLines: { time: moment.Moment, style: any }[] = [];

  @Output() clickTimeSegment: EventEmitter<ITimeSegmentTile> = new EventEmitter();
  @Output() clickNextTimeSegment: EventEmitter<TimeSegment> = new EventEmitter();
  @Output() changedDate: EventEmitter<moment.Moment> = new EventEmitter();

  @Input() set currentDate(date: moment.Moment) {
    this._currentDate = moment(date);
    this._defaultTimeWindow = { startTime: moment(this._currentDate).hour(8).minute(0).second(0).millisecond(0), endTime: moment(this._currentDate).hour(21).minute(30).second(0).millisecond(0), referenceFrom: "TOP" };
    this._currentDate$.next(moment(this._currentDate));
  }

  private _currentDate: moment.Moment = moment();
  private _currentDate$: Subject<moment.Moment> = new Subject();
  private _currentDateSubscription: Subscription = new Subscription();

  private _timeWindow: ITimeWindow = null;
  private _timeWindow$: Subject<ITimeWindow> = new Subject();
  private _timeWindowSubscription: Subscription = new Subscription();
  private _defaultTimeWindow: ITimeWindow = { startTime: moment(this._currentDate).hour(8).minute(0).second(0).millisecond(0), endTime: moment(this._currentDate).hour(21).minute(30).second(0).millisecond(0), referenceFrom: "TOP" };

  private _caretClicked: boolean = false;
  // private _dateChangedExternally: boolean = false;
  private _dateChangedInternally: boolean = false;
  private _manualDateChangeSubscription: Subscription = new Subscription();
  private _usingActiveWindow: boolean = false;


  private set timeWindow(timeWindow: ITimeWindow) {
    this._timeWindow = timeWindow;
    this._timeWindow$.next(this._timeWindow);
    if (this._caretClicked) {
      this._caretClicked = false;
      if (timeWindow.referenceFrom == "TOP") {
        if (moment(this._timeWindow.startTime).format('YYYY-MM-DD') != this._currentDate.format('YYYY-MM-DD')) {
          this._dateChangedInternally = true;
          this.changedDate.emit(this._timeWindow.startTime);
        }
      } else if (timeWindow.referenceFrom == "BOTTOM") {
        if (moment(this._timeWindow.endTime).format('YYYY-MM-DD') != this._currentDate.format('YYYY-MM-DD')) {
          this._dateChangedInternally = true;
          this.changedDate.emit(this._timeWindow.endTime);
        }
      }
    } 
    

  }


  ngOnInit() {
    this._fetchTimeSegmentsSubscription.unsubscribe();

    this._currentDateSubscription = this._currentDate$.subscribe((date: moment.Moment) => {
      this.startViewModeTimer();
      this._timeWindowSubscription.unsubscribe();
      this._timeWindowSubscription = this._timeWindow$.subscribe((timeWindow: ITimeWindow) => {
        this.buildDisplay(timeWindow);
        // this.ifLoading = false;
      });
      this.setTimeWindowFromDate(date);
    });
    this._currentDate$.next(moment());
  }

  private setTimeWindowFromDate(date: moment.Moment) {

    /*
      Three possible sources of date change:
      1. From external click (e.g. calendar)
      2. From internal click (e.g. Caret)
      3. From automatic time change (e.g. 11:59 rolls over past midnight)
    */


    if (this._dateChangedInternally) {
      this._dateChangedInternally = false;
    } else {
      if (moment().format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD')) {
        this.timeWindow = this.activeTimeWindow;
      } else {
        this.timeWindow = this._defaultTimeWindow;
      }
    }

  }

  private get activeTimeWindow(): ITimeWindow {
    console.log("Setting the active window");
    // this._caretClicked = true;
    let defaultWindowSizeHours: number = moment(this._defaultTimeWindow.endTime).diff(moment(this._defaultTimeWindow.startTime), 'hours');
    let newWindow: ITimeWindow = this._defaultTimeWindow;

    let now: moment.Moment = moment().hour(1).minute(45);
    now = moment().hour(0).minute(50);
    if (moment(now).isSameOrAfter(moment(newWindow.startTime)) && moment(now).isSameOrBefore(moment(newWindow.endTime))) {
      return newWindow;
    } else {
      if (moment(now).isAfter(moment(newWindow.endTime))) {
        newWindow.endTime = moment(now);
        newWindow.startTime = moment(now).subtract(defaultWindowSizeHours, "hours");
        return newWindow;
      } else if (moment(now).isBefore(moment(newWindow.startTime))) {
        let cutOffTime: moment.Moment = moment(newWindow.startTime).hour(4).minute(0).second(0).millisecond(0);
        if (moment(now).isBefore(moment(cutOffTime))) {
          newWindow.endTime = moment(now);
          newWindow.startTime = moment(now).subtract(defaultWindowSizeHours, "hours");
          return newWindow;
        } else if (moment(now).isSameOrAfter(moment(cutOffTime))) {
          newWindow.startTime = moment(now);
          newWindow.endTime = moment(now).add(defaultWindowSizeHours, "hours");
          return newWindow;
        }
        // console.log("    -Active window is before regular window. ")
        //in this case, logically, we must be after Midnight
      }
    }

    return newWindow;

  }


  private buildDisplay(timeWindow: ITimeWindow) {
    function roundTimes(timeWindow): ITimeWindow {
      /*
        The simple approach here is to retain a single layout shape, which is one where the hourLabels are offset directly in the center
        of where the bottom of one of the hourLines are.  
        
        E.G:
        _____
             |
         8am |------------
        _____|
             |
         9am |------------
        _____|

        By doing this, we need to start the frame above by a half hour and below by a half hour of a given hour.

        An alternative solution, to start at exactly 8:00am and not 7:30am, would be to design a different layout to accommodate that, but as of now, to retain the layout shape, the approach is that
        If the day start time is from 7:30am to 8:29am, then it gets rounded down to 7:30am 
        &
        If the day end time is from 10:31pm to 11:30pm, then it gets rounded up to 11:30pm 
      */
      let startTime: moment.Moment = moment(timeWindow.startTime);
      let earliestStart = (moment(startTime).hour(startTime.hour()).minute(0).second(0).millisecond(0)).subtract(30, 'minutes');
      if (startTime.isBefore(moment(earliestStart).add(1, 'hour'))) {
        startTime = moment(earliestStart);
      } else if (startTime.isSameOrAfter(moment(earliestStart).add(1, 'hour'))) {
        startTime = moment(earliestStart).add(1, 'hour');
      }
      let endTime: moment.Moment = moment(timeWindow.endTime);
      let latestEnd = (moment(endTime).hour(endTime.hour()).minute(0).second(0).millisecond(0)).add(1, 'hour').add(30, 'minutes');
      if (endTime.isSameOrBefore(moment(latestEnd).subtract(1, 'hour'))) {
        endTime = moment(latestEnd).subtract(1, 'hour');
      } else if (endTime.isAfter(moment(latestEnd).subtract(1, 'hour'))) {
        endTime = moment(latestEnd);
      }
      return { startTime: startTime, endTime: endTime, referenceFrom: "TOP" };
    }
    timeWindow = roundTimes(timeWindow);


    // let halfHours: number = moment(timeWindow.endTime).diff(moment(timeWindow.startTime), 'minutes') / 30;



    let hourLabels: { hour: string, style: any }[] = []
    let hourLines: { time: moment.Moment, style: any }[] = [];
    let currentHalfHour: moment.Moment = moment(timeWindow.startTime);

    let labelRowCount: number = 1;
    let lineRowCount: number = 1;

    while (moment(currentHalfHour).isBefore(moment(timeWindow.endTime))) {
      let labelGridRowStyle: string = "" + labelRowCount + " / span 2";
      let lineGridRowStyle: string = "" + lineRowCount + " / span 1";

      let lineBorderBottom: string = "none";
      let lineBorderTop: string = "1px solid rgb(220, 253, 255);";
      if (moment(currentHalfHour).minute() == 0) {
        lineBorderTop = "1px solid rgb(202, 238, 255)";
      }
      if (moment(currentHalfHour).isSame(moment(timeWindow.endTime).subtract(30, 'minutes'))) {
        lineBorderBottom = "1px solid rgb(220, 253, 255)";
      }
      if (moment(currentHalfHour).hour() == 0 && moment(currentHalfHour).minute() == 0) {
        lineBorderTop = "1px solid gray";
      }

      hourLines.push({ time: currentHalfHour, style: { "grid-row": lineGridRowStyle, "border-bottom": lineBorderBottom, "border-top": lineBorderTop } });
      if (currentHalfHour.minute() == 0) {
        hourLabels.push({ hour: moment(currentHalfHour).format('h a'), style: { "grid-row": labelGridRowStyle } });
        labelRowCount += 2;
      }
      currentHalfHour = moment(currentHalfHour).add(30, 'minutes');
      lineRowCount++;
    }

    this.hourLabels = hourLabels;
    this.hourLines = hourLines;
  }

  onClickCaret(direction: string) {

    let timeWindow: ITimeWindow = this._timeWindow;

    if (direction == "UP") {
      timeWindow.startTime = moment(timeWindow.startTime).subtract(1, 'hour');
      timeWindow.endTime = moment(timeWindow.endTime).subtract(1, 'hour');
      timeWindow.referenceFrom = "TOP";
    } else if (direction == "DOWN") {
      timeWindow.startTime = moment(timeWindow.startTime).add(1, 'hour');
      timeWindow.endTime = moment(timeWindow.endTime).add(1, 'hour');
      timeWindow.referenceFrom = "BOTTOM";
    }
    this._caretClicked = true;
    this.startViewModeTimer();
    this.timeWindow = timeWindow;
  }

  private startViewModeTimer() {
    console.log("Re-setting the viewModeTimer");
    this._nowSubscription.unsubscribe();
    this._manualDateChangeSubscription.unsubscribe();
    this._manualDateChangeSubscription = timer(5 * 60 * 1000).subscribe(() => {
      //every five minutes
      this.timeWindow = this.activeTimeWindow;
    })
  }

  // private automateView() {
  //   let currentTime = moment();
  //   this._nowSubscription.unsubscribe();
  //   this._nowSubscription = timer(5000, 5000).subscribe(() => {
  //     currentTime = moment();


  //     // console.log("Current time is now " + currentTime.format('YYYY-MM-DD hh:mm a'))
  //     // if (moment(currentTime).format('YYYY-MM-DD') != moment(this._currentDate).format('YYYY-MM-DD')) {
  //     //   console.log("We are now in automatic mode, and in automatic mode the date has changed.  So we are going to emit this change.")
  //     //   this.changedDate.emit(moment(currentTime));
  //     // }



  //   })
  // }



  ngOnDestroy() {
    this._fetchTimeSegmentsSubscription.unsubscribe();
    this._nowSubscription.unsubscribe();
    this._currentDateSubscription.unsubscribe();
    this._timeWindowSubscription.unsubscribe();

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


  activityName(tile: ITimeSegmentTile): string {
    if (tile.timeSegment.activities.length > 0) {
      return tile.timeSegment.activities[0].activity.name;
    } else {
      return "";
    }
  }


}
