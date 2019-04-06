import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { Subscription, timer, Subject } from 'rxjs';
import { TimeSegmentTile } from './time-segment-tile/time-segment-tile.model';
import { TimeSegment } from './time-segment-tile/time-segment.model';
import { TimelogService } from './timelog.service';
import { faSpinner, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { ITimeWindow } from './time-window.interface';
import { ITimeSegmentFormData } from '../time-segment-form/time-segment-form-data.interface';




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


  ifLoading: boolean = false;


  private _fetchTimeSegmentsSubscription: Subscription = new Subscription();
  private _fetchTimeSegmentsTimerSubscription: Subscription = new Subscription();



  private _timeSegments: TimeSegment[] = [];
  timeSegmentTiles: TimeSegmentTile[] = [];
  timeSegmentsContainer: { style: any } = null;

  hourLabels: { hour: string, style: any }[] = [];
  hourLines: { time: moment.Moment, style: any }[] = [];
  nowLine: { containerStyle: any } = null;
  private _nowLineSubscription: Subscription = new Subscription();


  @Output() timeSegmentFormData: EventEmitter<ITimeSegmentFormData> = new EventEmitter();
  @Output() changedDate: EventEmitter<moment.Moment> = new EventEmitter();

  @Input() set currentDate(date: moment.Moment) {
    this._currentDate = moment(date);
    this._defaultTimeWindow = { startTime: moment(this._currentDate).hour(8).minute(0).second(0).millisecond(0), endTime: moment(this._currentDate).hour(21).minute(30).second(0).millisecond(0), referenceFrom: "DEFAULT" };
    this._currentDate$.next(moment(this._currentDate));
  }

  private _currentDate: moment.Moment = null;
  private _currentDate$: Subject<moment.Moment> = new Subject();
  private _currentDateSubscription: Subscription = new Subscription();

  private _timeWindow: ITimeWindow = null;
  private _timeWindow$: Subject<ITimeWindow> = new Subject();
  private _timeWindowSubscription: Subscription = new Subscription();
  private _defaultTimeWindow: ITimeWindow = { startTime: moment(this._currentDate).hour(8).minute(0).second(0).millisecond(0), endTime: moment(this._currentDate).hour(21).minute(30).second(0).millisecond(0), referenceFrom: "DEFAULT" };

  private _caretClicked: boolean = false;
  private _dateChangedInternally: boolean = false;
  private _manualDateChangeSubscription: Subscription = new Subscription();








  ngOnInit() {
    // console.log("Re-initialized?")
    this._currentDateSubscription = this._currentDate$.subscribe((date: moment.Moment) => {
      this.dateChanged(date);
      // this.timelogService.fetchTimeSegmentsByRange(moment(date).subtract(1, 'day'), moment(date).add(1, 'day'));
    });


    this._fetchTimeSegmentsTimerSubscription.unsubscribe();
    this._fetchTimeSegmentsTimerSubscription = timer(0, 30000).subscribe(() => {
      // console.log("Every 30 seconds: " + moment().format('YYYY-MM-DD hh:mm a'))
      this._fetchTimeSegmentsSubscription.unsubscribe();
      this._fetchTimeSegmentsSubscription = this.timelogService.timeSegments$.subscribe((receivedTimeSegments: TimeSegment[]) => {
        // console.log("Received new TimeSegments: ", receivedTimeSegments);

        this._timeSegments = Object.assign([], receivedTimeSegments);
        this.drawTimeSegments();

      });
    });
    this.dateChanged(this._currentDate);


  }

  private set timeWindow(timeWindow: ITimeWindow) {
    this._timeWindow = this.roundTimes(timeWindow);
    this._timeWindow$.next(this._timeWindow);
    if (this._caretClicked) {
      this._caretClicked = false;
      if (timeWindow.referenceFrom == "TOP") {
        if (moment(this._timeWindow.startTime).format('YYYY-MM-DD') != this._currentDate.format('YYYY-MM-DD')) {
          this._dateChangedInternally = true;
          this.changedDate.emit(this._timeWindow.startTime);
          // this.router.navigate(['/daybook/' + this._timeWindow.startTime.format('YYYY-MM-DD')]);
        }
      } else if (timeWindow.referenceFrom == "BOTTOM") {
        if (moment(this._timeWindow.endTime).format('YYYY-MM-DD') != this._currentDate.format('YYYY-MM-DD')) {
          this._dateChangedInternally = true;
          this.changedDate.emit(this._timeWindow.endTime);
          // this.router.navigate(['/daybook/' + this._timeWindow.endTime.format('YYYY-MM-DD')]);
        }
      }
    }


  }
  private setTimeWindowFromDate(date: moment.Moment) {

    if (this._dateChangedInternally) {
      this._dateChangedInternally = false;
    } else {
      if (moment().format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD')) {
        // if its today, then use the active window, which might be different from the default window.
        this.timeWindow = this.activeTimeWindow;
      } else {
        this.timeWindow = this._defaultTimeWindow;
      }
    }

  }
  private get activeTimeWindow(): ITimeWindow {
    let defaultWindowSizeHours: number = moment(this._defaultTimeWindow.endTime).diff(moment(this._defaultTimeWindow.startTime), 'hours');
    let newWindow: ITimeWindow = this.roundTimes(this._defaultTimeWindow);

    let now: moment.Moment = moment();
    if (moment(now).isSameOrAfter(moment(newWindow.startTime).add(1, "hour")) && moment(now).isSameOrBefore(moment(newWindow.endTime).subtract(1, "hour"))) {
      return newWindow;
    } else {
      if (moment(now).isAfter(moment(newWindow.endTime).subtract(1, "hour"))) {
        newWindow.endTime = moment(now).add(1, "hour");
        newWindow.startTime = moment(newWindow.endTime).subtract(defaultWindowSizeHours, "hours");
        return newWindow;
      } else if (moment(now).isBefore(moment(newWindow.startTime).subtract(1, "hour"))) {
        let cutOffTime: moment.Moment = moment(newWindow.startTime).hour(4).minute(0).second(0).millisecond(0);
        /*
            cutOffTime is a variable which basically sets the top or bottom of the window, when the time is basically during regular sleeping hours
            in other words, there is an assumption that if you are viewing the active window at 3:00am (or any time PRIOR to the cutOffTime), you are probably still awake from the previous day, and 
            if you are viewing the active window AFTER the cutOffTime, then the assumption is that you have woken up and began your new day, even though it is early.

        */
        if (moment(now).isBefore(moment(cutOffTime))) {
          //therefore it is now between 12:00am and 4:00am
          newWindow.endTime = moment(now).add(1, "hour");
          newWindow.startTime = moment(newWindow.endTime).subtract(defaultWindowSizeHours, "hours");
          return newWindow;
        } else if (moment(now).isSameOrAfter(moment(cutOffTime))) {
          //it is after 4 am
          newWindow.startTime = moment(now).subtract(1, "hour");
          newWindow.endTime = moment(newWindow.startTime).add(defaultWindowSizeHours, "hours");
          return newWindow;
        }
      }
    }

    return newWindow;

  }
  private roundTimes(timeWindow): ITimeWindow {
    /*
      The simple approach here is to retain a single layout shape, which is one where the hourLabels are offset directly in the center
      of where the bottom of one of the hourLines are.  
      
      E.G:
      _____ ____________
           |
       8am |------------
      _____|____________
           |
       9am |------------
      _____|____________

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
    return { startTime: startTime, endTime: endTime, referenceFrom: timeWindow.referenceFrom };
  }
  private dateChanged(date: moment.Moment) {
    this.timelogService.fetchTimeSegmentsByRange(moment(date).startOf('day').subtract(1, 'day'), moment(date).endOf('day').add(1, 'day'));
    this.startViewModeTimer();
    this._timeWindowSubscription.unsubscribe();
    this._timeWindowSubscription = this._timeWindow$.subscribe((timeWindow: ITimeWindow) => {
      this.buildDisplay(timeWindow);
      this.drawTimeSegments();
    });
    this.setTimeWindowFromDate(date);

  }



  private buildDisplay(timeWindow: ITimeWindow) {


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


    this.drawNowLine();


  }
  private drawTimeSegments() {


    function earliestOf(times: moment.Moment[]): moment.Moment {
      times = times.filter(time => time !== null);
      times.sort((timeA, timeB) => {
        if (timeA.isBefore(timeB)) {
          return -1;
        } else if (timeA.isAfter(timeB)) {
          return 1;
        } else {
          return 0;
        }

      });
      return moment(times[0]);
    }

    function crossesNow(tile: TimeSegmentTile, now: moment.Moment, timeSegment?: TimeSegment): TimeSegmentTile[] {
      let tiles: TimeSegmentTile[] = [];
      let setTimeSegment: TimeSegment = null;
      if (timeSegment) {
        setTimeSegment = new TimeSegment(timeSegment.id, timeSegment.userId, timeSegment.startTimeISO, timeSegment.endTimeISO, timeSegment.description);
        setTimeSegment.activities = timeSegment.activities;
      }

      if (tile.startTime.isBefore(now) && tile.endTime.isAfter(now)) {
        tiles.push(buildTile(tile.startTime, now, setTimeSegment, "MIDDLE"));
        tiles.push(buildTile(now, tile.endTime, null, "MIDDLE"));
        return tiles;
      } else {
        return null;
      }


    }


    function buildTile(startTime: moment.Moment, endTime: moment.Moment, timeSegment: TimeSegment, borderNoRadius: string): TimeSegmentTile {
      function tileBackgroundColor(timeSegment: TimeSegment): string {
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
        if (timeSegment != null) {
          if (timeSegment.activities.length > 0) {
            let color = timeSegment.activities[0].activity.color;
            return hexToRGB(color, 0.5);

          } else {
            return hexToRGB("#ffffff", 0.5);
          }
        } else {
          return hexToRGB("#ffffff", 0.01);
        }

      }
      if (timeSegment == null) {
        // console.log("building a blank timeSegment")
      }
      let tile: TimeSegmentTile = new TimeSegmentTile(timeSegment, startTime, endTime);
      if (borderNoRadius == "TOP") {
        tile.style = {
          "border-top-left-radius": "0px",
          "border-top-right-radius": "0px",
          "border-bottom-left-radius": "4px",
          "border-bottom-right-radius": "4px",
          "background-color": tileBackgroundColor(timeSegment)
        };

      } else if (borderNoRadius == "BOTTOM") {
        tile.style = {
          "border-top-left-radius": "4px",
          "border-top-right-radius": "4px",
          "border-bottom-left-radius": "0px",
          "border-bottom-right-radius": "0px",
          "background-color": tileBackgroundColor(timeSegment)
        };
      } else if (borderNoRadius == "TOP AND BOTTOM") {
        tile.style = {
          "border-radius": "0px",
          "background-color": tileBackgroundColor(timeSegment)
        };
      } else {
        tile.style = {
          "border-radius": "4px",
          "background-color": tileBackgroundColor(timeSegment)
        };
      }


      return tile
    }


    if (this._timeSegments.length > 0 && this._timeWindow) {

      let windowTimeSegments: TimeSegment[] = [];

      for (let timeSegment of this._timeSegments) {
        if ((moment(timeSegment.startTime).isSameOrBefore(moment(this._timeWindow.startTime)) && moment(timeSegment.endTime).isAfter(moment(this._timeWindow.startTime)))
          || (moment(timeSegment.startTime).isSameOrAfter(moment(this._timeWindow.startTime)) && moment(timeSegment.endTime).isSameOrBefore(moment(this._timeWindow.endTime)))
          || (moment(timeSegment.startTime).isBefore(moment(this._timeWindow.endTime)) && moment(timeSegment.endTime).isSameOrAfter(moment(this._timeWindow.endTime)))
        ) {
          // windowTimeSegments.push(Object.assign({}, timeSegment ));
          /*
            Warning
             we are pushing the timeSegment: 
             in this example, would this mean that the timeSegment being pushed to this new array in fact refers to the same object that exists elsewhere in memory,
             for example is it the same one that the service is holding, and therfore, if so, would that mean that any changes made to this one will modify the object in memory which is being used by the rest of the app ?
             something to be aware of i think    
          */
          windowTimeSegments.push(timeSegment);
        }
      }
      windowTimeSegments.sort((a, b) => {
        if (a.startTime.isAfter(b.startTime)) {
          return 1;
        }
        if (a.startTime.isBefore(b.startTime)) {
          return -1;
        }
        return 0;
      })
      //  At this point, all time segments will be within the window.

      /*
        Under this current design, it is not permissable for time Events to overlap 
        (for example, one event can not start at a time which is prior to the ending of the previous event)
        Any detected overlaps will be overwritten.

        A way to implement overlap would be to build all tiles, and then detect if the tiles overlap.
        if overlap, create a second column, put the overlapping timesegments in the second column,
        the rest of the non-overlapping timesegments are fully wide, across both+ columns.
      */



      if (windowTimeSegments.length > 0) {


        let startTimeMarker: moment.Moment = moment(this._timeWindow.startTime);
        let endTimeMarker: moment.Moment = moment(this._timeWindow.endTime)



        let pastNow: boolean = false;
        let now: moment.Moment = moment();
        if (now.isAfter(startTimeMarker) && now.isBefore(endTimeMarker)) {
          now = moment(now).second(0).millisecond(0);
        } else {
          now = null;
          pastNow = true;
        }

        let currentStartTimeLimit: moment.Moment = moment(startTimeMarker);
        let currentEndTimeLimit: moment.Moment = null;

        let tileStartTime: moment.Moment = null;
        let tileEndTime: moment.Moment = null;

        let tiles: TimeSegmentTile[] = [];


        for (let timeSegment of windowTimeSegments) {
          tileStartTime = moment(timeSegment.startTime);
          tileEndTime = moment(timeSegment.endTime);

          let borderNoRadius: string = "MIDDLE";
          if (windowTimeSegments.indexOf(timeSegment) == 0 && timeSegment.startTime.isBefore(startTimeMarker)) {
            borderNoRadius = "TOP";
          }
          if (windowTimeSegments.indexOf(timeSegment) == windowTimeSegments.length - 1 && timeSegment.endTime.isAfter(endTimeMarker)) {
            borderNoRadius = "BOTTOM";
          }

          let nextTimeSegmentEndTime: moment.Moment = null;
          if (windowTimeSegments.indexOf(timeSegment) < windowTimeSegments.length - 1) {
            nextTimeSegmentEndTime = moment(windowTimeSegments[windowTimeSegments.indexOf(timeSegment) + 1].endTime);
          } else {
            nextTimeSegmentEndTime = moment(endTimeMarker);
          }


          currentEndTimeLimit = earliestOf([endTimeMarker, nextTimeSegmentEndTime]);


          let startGap: TimeSegmentTile = null;
          let timeSegmentTile: TimeSegmentTile = null;
          let nowCrosses: TimeSegmentTile[] = null;


          if (timeSegment.startTime.isBefore(currentStartTimeLimit)) {
            tileStartTime = moment(currentStartTimeLimit);
          } else if (timeSegment.startTime.isAfter(currentStartTimeLimit)) {
            startGap = buildTile(currentStartTimeLimit, timeSegment.startTime, null, "MIDDLE");
            nowCrosses = crossesNow(startGap, now);
            if (nowCrosses) {
              for (let tile of nowCrosses) {
                tiles.push(tile);
              }
            } else {
              tiles.push(startGap);
            }
            nowCrosses = null;
            tileStartTime = moment(timeSegment.startTime);
          }
          if (timeSegment.endTime.isAfter(currentEndTimeLimit)) {
            tileEndTime = moment(currentEndTimeLimit);
          }

          timeSegmentTile = buildTile(tileStartTime, tileEndTime, timeSegment, borderNoRadius);
          nowCrosses = crossesNow(timeSegmentTile, now, timeSegment);
          if (nowCrosses) {
            for (let tile of nowCrosses) {
              tiles.push(tile);
            }
          } else {
            tiles.push(timeSegmentTile);
          }
          nowCrosses = null;



          currentStartTimeLimit = moment(tileEndTime);
          currentEndTimeLimit = earliestOf([endTimeMarker, nextTimeSegmentEndTime]);
        }












        // console.log("final end time of " + tileEndTime.format('hh:mm a'))

        let endGapSeconds: number = 0;

        if (!pastNow) {
          if (tileEndTime.isBefore(now)) {

            tiles.push(buildTile(tileEndTime, now, null, "MIDDLE"));
            tileEndTime = moment(now);
          }
        }

        if (tileEndTime.isBefore(endTimeMarker)) {
          let diff: number = moment(endTimeMarker).diff(tileEndTime, "seconds");
          if (diff < (60 * 60)) {
            tiles.push(buildTile(tileEndTime, endTimeMarker, null, "MIDDLE"));
          } else {
            endGapSeconds = diff;
          }

        }




        let sum: number = 0;
        let percentages: number[] = [];
        tiles.forEach((tile) => {
          let seconds = (moment(tile.endTime).diff(moment(tile.startTime), 'seconds'));
          sum += seconds;
        })
        if (endGapSeconds > 0) {
          sum += endGapSeconds;
        }
        let windowSum: number = moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds');
        if (windowSum != sum) {
          console.log("Error: miscalculation - sum does not add up to window sum.  Sum must add up to " + windowSum + " but is actually " + sum);
        }

        tiles.forEach((tile) => {
          let percent: number = ((moment(tile.endTime).diff(moment(tile.startTime), 'seconds')) / sum) * 100;
          percentages.push(percent);
        })


        if (endGapSeconds > 0) {
          percentages.push((endGapSeconds / sum) * 100);
        }



        let gridTemplateRows: string = "";
        percentages.forEach((percentage: number) => {
          gridTemplateRows += "" + percentage + "% ";
        })
        let style: any = {
          "grid-template-rows": gridTemplateRows
        };



        this.timeSegmentTiles = tiles;
        this.timeSegmentsContainer = { style: style };




      } else {
        
        this.timeSegmentsContainer = null;
        this.timeSegmentTiles = [];
        
      }


    } else {

      this.timeSegmentsContainer = null;
      this.timeSegmentTiles = [];
      
    }
  }
  private drawNowLine() {
    this._nowLineSubscription.unsubscribe();
    this._nowLineSubscription = timer(0, 30000).subscribe(() => {
      let currentView: ITimeWindow = this._timeWindow;
      let now: moment.Moment = moment();
      if (moment(now).isSameOrAfter(moment(currentView.startTime)) && moment(now).isSameOrBefore(moment(currentView.endTime))) {
        let totalDuration: number = moment(currentView.endTime).diff(moment(currentView.startTime), 'minutes');
        let nowTimeDuration: number = moment(now).diff(moment(currentView.startTime), 'minutes');
        let percentage = (nowTimeDuration / totalDuration) * 100;
        let style: any = {
          "display": "grid",
          "grid-template-rows": percentage + "% " + (100 - percentage) + "%"
        };
        this.nowLine = { containerStyle: style };
        this.drawTimeSegments();
      } else {
        this.nowLine = null;
      }
    });
  }










  onTimeSegmentFormDataReceived(data: ITimeSegmentFormData) {
    this.timeSegmentFormData.emit(data);
  }

  onClickCaret(direction: string) {

    let timeWindow: ITimeWindow = this._timeWindow;

    let hours: number = 1;
    if (direction == "UP") {
      if (this._timeWindow.referenceFrom == "TOP") {
        hours = 2;
      }
      timeWindow.startTime = moment(timeWindow.startTime).subtract(hours, 'hour');
      timeWindow.endTime = moment(timeWindow.endTime).subtract(hours, 'hour');
      timeWindow.referenceFrom = "TOP";
    } else if (direction == "DOWN") {
      if (this._timeWindow.referenceFrom == "BOTTOM") {
        hours = 2;
      }
      timeWindow.startTime = moment(timeWindow.startTime).add(hours, 'hour');
      timeWindow.endTime = moment(timeWindow.endTime).add(hours, 'hour');
      timeWindow.referenceFrom = "BOTTOM";
    }
    this._caretClicked = true;
    this.startViewModeTimer();
    this.timeWindow = timeWindow;
  }

  private startViewModeTimer() {
    /*
      The purpose of this method is to set a 5 minute time listener, 
      so that after 5 minutes of inactivity, the view window will be set to active window.
      e.g. you are browsing through the timelog from 5 days ago, then walk away from your PC
      5 minutes later, the view is returned to your current active day view.
    */
    this._manualDateChangeSubscription.unsubscribe();
    this._manualDateChangeSubscription = timer(5 * 60 * 1000).subscribe(() => {
      //every five minutes
      this.timeWindow = this.activeTimeWindow;
    })
  }


  ngOnDestroy() {
    this._fetchTimeSegmentsSubscription.unsubscribe();
    this._currentDateSubscription.unsubscribe();
    this._timeWindowSubscription.unsubscribe();
    this._manualDateChangeSubscription.unsubscribe();
    this._fetchTimeSegmentsSubscription.unsubscribe();
    this._fetchTimeSegmentsTimerSubscription.unsubscribe();

  }
}
