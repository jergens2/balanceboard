import { Component, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from '../timelog/timelog.service';
import { Subscription, timer, Subject } from 'rxjs';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { TimeSegment } from '../timelog/time-segment.model';
import { ITimeSegmentTile } from './time-segment-tile.interface';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }

  faCalendar = faCalendarAlt;
  ifCalendarInside: boolean = false;

  // dayStartTime: moment.Moment;
  // dayEndTime: moment.Moment;


  /* bed time is the time you start trying to go to sleep */
  /* fall asleep time is the time that you are aiming to be sleeping by */
  wakeUpTomorrowTime: moment.Moment;
  bedTime: moment.Moment;
  fallAsleepTime: moment.Moment;




  daybookBodyStyle: any = {};
  hourLabels: any[] = [];
  bookLines: any[] = [];

  nowLineContainerStyle: any = {};
  nowTime: moment.Moment = moment();
  nowTimeContainerStyle: any = {};
  ifNowLine: boolean = false;

  bedTimeStyle: any = {};
  bedTimeString: string = "";
  ifBedTime: boolean = false;

  nowSubscription: Subscription = new Subscription();


  timeSegmentTiles: ITimeSegmentTile[] = [];

  private _currentDate: moment.Moment;
  get currentDate(): moment.Moment {
    return this._currentDate
  }
  set currentDate(newDate) {
    this._currentDate = moment(newDate);
    this._currentDate$.next(this._currentDate);
  }
  private _currentDate$: Subject<moment.Moment> = new Subject();
  timeSegments: TimeSegment[] = [];

  ngOnInit() {
    this.currentDate = moment();
    let dayStartTime = moment(this.currentDate).hour(7).minute(30).second(0).millisecond(0);
    let dayEndTime = moment(this.currentDate).hour(22).minute(30).second(0).millisecond(0);
    this.buildDisplay(dayStartTime, dayEndTime);
    this.nowSubscription.unsubscribe();
    this.nowSubscription = timer(0, 60000).subscribe(() => {
      this.buildDisplay(dayStartTime, dayEndTime);
    })

    this.timeLogService.fetchTimeSegmentsByDay(this.currentDate).subscribe((timeSegments) => {
      this.timeSegments = timeSegments;
      this.displayTimeSegments(this.timeSegments, dayStartTime, dayEndTime);
    });

    this._currentDate$.subscribe((date) => {

      let dayStartTime = moment(this.currentDate).hour(7).minute(30).second(0).millisecond(0);
      let dayEndTime = moment(this.currentDate).hour(22).minute(30).second(0).millisecond(0);

      this.nowSubscription.unsubscribe();
      this.nowSubscription = timer(0, 60000).subscribe(() => {
        this.buildDisplay(dayStartTime, dayEndTime);
      })
      this.timeLogService.fetchTimeSegmentsByDay(date).subscribe((timeSegments) => {
        this.timeSegments = timeSegments;
        this.displayTimeSegments(this.timeSegments, dayStartTime, dayEndTime);
      });

    })




  }

  displayTimeSegments(timeSegments: TimeSegment[], dayStartTime: moment.Moment, dayEndTime: moment.Moment) {
    let startTime = moment(dayStartTime).subtract(30, 'minutes');
    if (startTime.minute() <= 15) {
      startTime.minute(0);
    } else if (startTime.minute() > 15 && startTime.minute() <= 45) {
      startTime.minute(30);
    } else {
      startTime.minute(60);
    }
    let endTime = moment(dayEndTime).add(30, 'minutes');
    /*
      2018-01-19
      The following is not a robust way of properly calculating the grids, but it works under the current defined start and end time.

      maybe a better way to do it is just grab the information from the style variable dayBookBodyStyle

      start time is 7:00am at gridIndex 1;
      7:00 to 7:30 would be 1 / span 1
      8:00 to 8:30 would be 3 / span 1
      10:00 to 11:30 would be 7 / span 3

    */
    let gridSegments: number = ((endTime.diff(startTime, 'hours')) + 1) * 2;

    function gridStart(segmentStart: moment.Moment): number {
      let gridIndex = 0;
      let difference = segmentStart.diff(startTime);
      if (difference < 0) {
        //segment start is before the daybook start time.
        return 0;
      } else {
        let currentTime = moment(startTime);
        while (currentTime.isSameOrBefore(segmentStart)) {
          gridIndex++;
          currentTime = moment(currentTime).add(30, 'minutes');
        }
        return gridIndex;
      }

    }

    let tiles: ITimeSegmentTile[] = [];

    for (let timeSegment of timeSegments) {
      let segmentStart = moment(timeSegment.startTime);
      let gridLineStart = gridStart(segmentStart);
      if (gridLineStart > 0 && gridLineStart < 34) {
        //that 34 number above needs to be dynamically referenced at some point and not a static number of 34.  this will change when the user 
        //changes their preferences for day start and end time.

        let segmentEnd = moment(timeSegment.endTime);
        let duration = segmentEnd.diff(segmentStart, 'minutes');

        if (duration >= 10) {
          //below line:  
          // I subtracted 2 because:  subtract 1 because grid-rows starts at index 1, but also because as above, the "real" start time is the defined startTime minus an additional 30 minutes (1 grid row/segment)
          let gridStartTime = moment(dayStartTime).add((30 * (gridLineStart - 2)), 'minutes');

          let gridSpan = Math.ceil(segmentEnd.diff(gridStartTime, 'minutes') / 30);
          let span = gridSpan * 30;

          let percentStart = (moment(segmentStart).diff(gridStartTime, 'minutes') / span) * 100;
          let percentDuration = (duration / span) * 100;
          let percentEnd = 100 - (percentStart + percentDuration);

          let containerStyle = {
            "grid-row": "" + gridLineStart + " / span " + gridSpan,
            "grid-template-rows": + percentStart + "% " + percentDuration + "% " + percentEnd + "%"
          };
          let durationStyle = {};
          if (duration < 30) {
            durationStyle = { "display": "none" };
          } else if (duration >= 30) {
            durationStyle = {};
          }



          let tile: ITimeSegmentTile = { timeSegment: timeSegment, containerStyle: containerStyle, durationStyle: durationStyle };
          tiles.push(tile);
        }


      } else {
        // dont add the tile because it is before the day start time.
        /*
          At some point it might be diligent to add kind of a secondary section of the daybook, for times when a person stays up past midnight the previous evening.
          e.g.:  you go to bed at 1:00am and wake up at 9:00 am.  the duration of time between 1 and 9 is a "squished" section because what's the point of being able
          to visualize 8 hours of sleep in this context?  not very useful

          so it would be like 2 seconds of daybook, e.g.

          | prior to sleep | 12:00am
          |________________|  1:00am
          |                |  9:00am
          | after sleep    | 10:00am

          something like this
        */
      }

    }
    this.timeSegmentTiles = tiles;
  }

  buildDisplay(dayStartTime: moment.Moment, dayEndTime: moment.Moment) {
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
    let gridLines: any[] = [];

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
          nowTimeContainerStyle = { "grid-row": "" + (gridIndex - 1) + " / span 3", "grid-column": "1 / span 1", "grid-template-rows": getGridTemplateRowsStyle(now, moment(currentTime).subtract(30, 'minutes'), 3) };
        }
      }

      // if (moment(this.bedTime).isAfter(currentTime) && moment(this.bedTime).isSameOrBefore(segmentEnd)) {
      //   bedTimeStyle = { "grid-row": "" + (gridIndex + 1) + " / -1 ", "grid-template-rows": getGridTemplateRowsStyle(this.bedTime, currentTime, 1) }
      // }

      let gridLine = {
        "line": gridIndex,
        "style": { "grid-column": " 2 / span 2", "grid-row": "" + gridIndex + " / span 1" }
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

    this.daybookBodyStyle = { "grid-template-rows": "repeat(" + gridIndex.toFixed(0) + ", 1fr)" }
    this.hourLabels = hourLabels;
    this.bookLines = gridLines;

    this.nowLineContainerStyle = nowLineContainerStyle;
    this.nowTimeContainerStyle = nowTimeContainerStyle;
    this.nowTime = now;


    // this.bedTimeString = this.calculateBedTimeString(now);

    // this.bedTimeStyle = bedTimeStyle;
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




  calculateBedTimeString(now: moment.Moment): string {
    let minutes = Math.abs(Math.floor(moment(now).diff(moment(this.bedTime), 'minutes')));
    let hours = Math.floor(minutes / 60)
    minutes = minutes - (hours * 60);

    if (moment(now).isBefore(moment(this.bedTime).subtract(3, 'hours'))) {
      return "Bed time: " + moment(this.bedTime).format('hh:mm a');
    } else if (moment(now).isBefore(moment(this.bedTime).subtract(1, 'minutes'))) {
      if (hours > 0 && minutes > 0) {
        return hoursString(hours) + " and " + minutesString(minutes) + " until bed time";
      } else if (minutes > 0) {
        return minutesString(minutes) + " until bed time";
      } else if (hours > 0) {
        return hoursString(hours) + " until bed time";
      }
    } else if (moment(now).isAfter(moment(this.bedTime).subtract(1, 'minutes')) && moment(now).isBefore(moment(this.bedTime).add('1 minutes'))) {
      return "It's bedtime.  Go to bed";
    } else {
      if (hours > 0 && minutes > 0) {
        return "It's " + hoursString(hours) + " and " + minutesString(minutes) + " past bed time.  Go to bed.";
      } else if (minutes > 0) {
        return "It's " + minutesString(minutes) + " past bed time.  Go to bed.";
      } else if (hours > 0) {
        return "It's " + hoursString(hours) + " past bed time.  Go to bed.";
      }
    }



    function minutesString(minutes: number): string {
      if (minutes == 0) {
        return "";
      } else if (minutes == 1) {
        return "1 minute";
      } else {
        return "" + minutes + " minutes";
      }
    }
    function hoursString(hours: number): string {
      if (hours == 0) {
        return "";
      } else if (hours == 1) {
        return "1 hour";
      } else {
        return "" + hours + " hours";
      }
    }


  }

  ngOnDestroy() {
    this.nowSubscription.unsubscribe();
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

  headerDate(daysDifference: number): string {
    let date = moment(this.currentDate).add(daysDifference, 'days');
    return date.format('MMM Do')

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
