import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { Subscription, timer, Subject } from 'rxjs';
import { TimeSegmentTile } from './time-segment-tile.model';
import { TimeSegment } from './time-segment.model';
import { TimelogService } from './timelog.service';
import { faSpinner, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { ITimeWindow } from './time-window.interface';
import { ITimeSegmentFormData } from '../time-segment-form/time-segment-form-data.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-time-log',
  templateUrl: './time-log.component.html',
  styleUrls: ['./time-log.component.css']
})
export class TimeLogComponent implements OnInit, OnDestroy {

  constructor(private timelogService: TimelogService, private router: Router) { }

  faSpinner = faSpinner;
  faCaretUp = faCaretUp;
  faCaretDown = faCaretDown;

  ifLoading: boolean = false;


  private _fetchTimeSegmentsSubscription: Subscription = new Subscription();



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


  private set timeWindow(timeWindow: ITimeWindow) {
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
      return { startTime: startTime, endTime: endTime, referenceFrom: timeWindow.referenceFrom };
    }


    this._timeWindow = roundTimes(timeWindow);
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


  ngOnInit() {
    console.log("Re-initialized?")
    this._currentDateSubscription = this._currentDate$.subscribe((date: moment.Moment) => {
      this.dateChanged(date);
      // this.timelogService.fetchTimeSegmentsByRange(moment(date).subtract(1, 'day'), moment(date).add(1, 'day'));
    });


    this._fetchTimeSegmentsSubscription.unsubscribe();
    this._fetchTimeSegmentsSubscription = this.timelogService.timeSegments$.subscribe((receivedTimeSegments: TimeSegment[]) => {
      if(receivedTimeSegments.length > 0){
        this._timeSegments = Object.assign([], receivedTimeSegments);
        this.drawTimeSegments();
      }
    });

    this.dateChanged(this._currentDate);


  }

  private dateChanged(date: moment.Moment){
    this.timelogService.fetchTimeSegmentsByRange(moment(date).startOf('day').subtract(1, 'day'), moment(date).endOf('day').add(1, 'day'));
    this.startViewModeTimer();
    this._timeWindowSubscription.unsubscribe();
    this._timeWindowSubscription = this._timeWindow$.subscribe((timeWindow: ITimeWindow) => {
      this.buildDisplay(timeWindow);
      this.drawTimeSegments();
    });
    this.setTimeWindowFromDate(date);

  }

  // private receiveTimeSegments(timeSegments: TimeSegment[]) {
  //   for (let timeSegment of timeSegments) {
  //     let alreadyExists: boolean = false;
  //     this._timeSegments.forEach((existingTimeSegment) => {
  //       if (existingTimeSegment.id == timeSegment.id) {
  //         alreadyExists = true;
  //       }
  //     });

  //     if (!alreadyExists) {
  //       this._timeSegments.push(timeSegment);
  //     }
  //   }

  //   this._timeSegments.sort((a, b) => {
  //     if (a.startTimeISO > b.startTimeISO) {
  //       return 1;
  //     }
  //     if (a.startTimeISO < b.startTimeISO) {
  //       return -1;
  //     }
  //     return 0;
  //   });
  //   // this.drawTimeSegments();
  // }

  private drawTimeSegments() {
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
        return "";
      }

    }
    function buildTile(startTime: moment.Moment, endTime: moment.Moment, timeSegment: TimeSegment, borderNoRadius: string): TimeSegmentTile {
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
          windowTimeSegments.push(timeSegment);
        }
      }
      //  At this point, all time segments will be within the window.




      let increments: { seconds: number, tile: TimeSegmentTile }[] = [];

      let startTimeMarker: moment.Moment = moment(this._timeWindow.startTime);
      let endTimeMarker: moment.Moment = moment(this._timeWindow.startTime)

      /*
        Under this current design, it is not permissable for time Events to overlap 
        (for example, one event can not start at a time which is prior to the ending of the previous event)

        Should time events be able to overlap ?  or, by their very design, should a time event represent a period of time 
        which explicitly does not overlap ?
      */



      for (let timeSegment of windowTimeSegments) {


        if (windowTimeSegments.indexOf(timeSegment) == 0) {
          //for the first one:
          if (moment(timeSegment.startTime).isSameOrBefore(this._timeWindow.startTime)) {
            //theres no gap
            startTimeMarker = moment(this._timeWindow.startTime);
            endTimeMarker = moment(timeSegment.endTime);
            increments.push({
              seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
              tile: buildTile(startTimeMarker, endTimeMarker, timeSegment, "TOP")
            });

          } else if (moment(timeSegment.startTime).isAfter(this._timeWindow.startTime)) {
            //there is a gap;
            startTimeMarker = moment(this._timeWindow.startTime);
            endTimeMarker = moment(timeSegment.startTime);
            increments.push({
              seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
              tile: buildTile(startTimeMarker, endTimeMarker, null, "MIDDLE")
            });

            startTimeMarker = moment(timeSegment.startTime);
            endTimeMarker = moment(timeSegment.endTime);
            increments.push({
              seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
              tile: buildTile(startTimeMarker, endTimeMarker, timeSegment, "MIDDLE")
            });
          }
        }
        else if (windowTimeSegments.indexOf(timeSegment) < windowTimeSegments.length - 1) {
          //for all but the first one:

          if (moment(timeSegment.startTime).isSame(endTimeMarker)) {
            //this timeSegment starts where the previous one left off
            startTimeMarker = moment(timeSegment.startTime);
            endTimeMarker = moment(timeSegment.endTime);
            increments.push({
              seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
              tile: buildTile(startTimeMarker, endTimeMarker, timeSegment, "MIDDLE")
            });
          } else if (moment(timeSegment.startTime).isAfter(endTimeMarker)) {
            //there is a gap

            startTimeMarker = moment(endTimeMarker);
            endTimeMarker = moment(timeSegment.startTime);
            increments.push({
              seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
              tile: buildTile(startTimeMarker, endTimeMarker, null, "MIDDLE")
            });

            startTimeMarker = moment(endTimeMarker);
            endTimeMarker = moment(timeSegment.endTime);
            increments.push({
              seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
              tile: buildTile(startTimeMarker, endTimeMarker, timeSegment, "MIDDLE")
            });
          } else {
            //timesegment starts prior to the end of the last one
            //i.e. there is an overlap. 
            //this shouldnt happen, unless... ?
            console.log("This should never happen unless there is an issue... ");
          }

        } else if (windowTimeSegments.indexOf(timeSegment) == windowTimeSegments.length - 1) {
          //the last one
          if (timeSegment.startTime.isSameOrBefore(moment(endTimeMarker))) {
            if (timeSegment.endTime.isAfter(this._timeWindow.endTime)) {


              startTimeMarker = moment(timeSegment.startTime);
              endTimeMarker = moment(this._timeWindow.endTime);
              increments.push({
                seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
                tile: buildTile(startTimeMarker, endTimeMarker, timeSegment, "BOTTOM")
              });

            } else if (timeSegment.endTime.isSameOrBefore(this._timeWindow.endTime)) {
              startTimeMarker = moment(timeSegment.startTime);
              endTimeMarker = moment(timeSegment.endTime);
              increments.push({
                seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
                tile: buildTile(startTimeMarker, endTimeMarker, timeSegment, "MIDDLE")
              });

              if (timeSegment.endTime.isBefore(this._timeWindow.endTime)) {
                startTimeMarker = moment(endTimeMarker);
                endTimeMarker = moment(this._timeWindow.endTime);
                increments.push({
                  seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
                  tile: buildTile(startTimeMarker, endTimeMarker, null, "BOTTOM")
                });
              }

            }
          } else if (timeSegment.startTime.isAfter(moment(endTimeMarker))) {
            //there is a gap

            startTimeMarker = moment(endTimeMarker);
            endTimeMarker = moment(timeSegment.startTime);
            increments.push({
              seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
              tile: buildTile(startTimeMarker, endTimeMarker, null, "MIDDLE")
            });

            if (timeSegment.endTime.isAfter(this._timeWindow.endTime)) {


              startTimeMarker = moment(timeSegment.startTime);
              endTimeMarker = moment(this._timeWindow.endTime);
              increments.push({
                seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
                tile: buildTile(startTimeMarker, endTimeMarker, timeSegment, "BOTTOM")
              });

            } else if (timeSegment.endTime.isSameOrBefore(this._timeWindow.endTime)) {
              startTimeMarker = moment(timeSegment.startTime);
              endTimeMarker = moment(timeSegment.endTime);
              increments.push({
                seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
                tile: buildTile(startTimeMarker, endTimeMarker, timeSegment, "MIDDLE")
              });

              if (timeSegment.endTime.isBefore(this._timeWindow.endTime)) {
                startTimeMarker = moment(endTimeMarker);
                endTimeMarker = moment(this._timeWindow.endTime);
                increments.push({
                  seconds: moment(endTimeMarker).diff(moment(startTimeMarker), 'seconds'),
                  tile: buildTile(startTimeMarker, endTimeMarker, null, "BOTTOM")
                });
              }

            }
          }




        } else {
          //this should never happen, unless something is broken;
          console.log("This should never happen... ?")
        }

      }

      let sum: number = 0;
      for (let increment of increments) {
        sum += increment.seconds;
      }


      let style: any = {};
      let percentages: number[] = [];
      let timeSegmentTiles: TimeSegmentTile[] = [];
      for (let increment of increments) {
        percentages.push((increment.seconds / sum) * 100);
        timeSegmentTiles.push(increment.tile);
      }

      let gridTemplateRows: string = "";
      for (let percentage of percentages) {
        gridTemplateRows += "" + percentage + "% ";
      }
      style = { "grid-template-rows": gridTemplateRows };



      this.timeSegmentTiles = timeSegmentTiles;
      this.timeSegmentsContainer = { style: style };

    }
  }



  private setTimeWindowFromDate(date: moment.Moment) {

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
    let defaultWindowSizeHours: number = moment(this._defaultTimeWindow.endTime).diff(moment(this._defaultTimeWindow.startTime), 'hours');
    let newWindow: ITimeWindow = this._defaultTimeWindow;

    let now: moment.Moment = moment();
    if (moment(now).isSameOrAfter(moment(newWindow.startTime)) && moment(now).isSameOrBefore(moment(newWindow.endTime))) {
      return newWindow;
    } else {
      if (moment(now).isAfter(moment(newWindow.endTime).subtract(15, 'minutes'))) {
        newWindow.endTime = moment(now);
        newWindow.startTime = moment(now).subtract(defaultWindowSizeHours, "hours");
        return newWindow;
      } else if (moment(now).isBefore(moment(newWindow.startTime).add(15, 'minutes'))) {
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
      }
    }

    return newWindow;

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


  private drawNowLine() {
    this._nowLineSubscription.unsubscribe();
    this._nowLineSubscription = timer(0, 60000).subscribe(() => {
      let currentView: ITimeWindow = this._timeWindow;
      if (moment().isSameOrAfter(moment(currentView.startTime)) && moment().isSameOrBefore(moment(currentView.endTime))) {
        let totalDuration: number = moment(currentView.endTime).diff(moment(currentView.startTime), 'minutes');
        let nowTimeDuration: number = moment().diff(moment(currentView.startTime), 'minutes');
        let percentage = (nowTimeDuration / totalDuration) * 100;
        let style: any = {
          "display": "grid",
          "grid-template-rows": percentage + "% " + (100 - percentage) + "%"
        };
        this.nowLine = { containerStyle: style };
      } else {
        this.nowLine = null;
      }
    });
  }

  onClickCaret(direction: string) {

    let timeWindow: ITimeWindow = this._timeWindow;

    let hours: number = 1;
    if (direction == "UP") {
      if(this._timeWindow.referenceFrom == "TOP"){
        hours = 2;
      }
      timeWindow.startTime = moment(timeWindow.startTime).subtract(hours, 'hour');
      timeWindow.endTime = moment(timeWindow.endTime).subtract(hours, 'hour');
      timeWindow.referenceFrom = "TOP";
    } else if (direction == "DOWN") {
      if(this._timeWindow.referenceFrom == "BOTTOM"){
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

  }



  activityName(tile: TimeSegmentTile): string {
    if (moment(tile.endTime).diff(moment(tile.startTime), 'minutes') > 19) {
      if (tile.timeSegment.activities.length > 0) {
        return tile.timeSegment.activities[0].activity.name;
      } else {
        return "";
      }
    } else {
      return "";
    }

  }

  onClickTile(tile: TimeSegmentTile) {
    console.log("Span:" + tile.timeSegment.startTime.format('YYYY-MM-DD hh:mm a') + " to " + tile.timeSegment.endTime.format('YYYY-MM-DD hh:mm a'))
  }


}
