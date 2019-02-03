import { Component, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from '../timelog/timelog.service';
import { Subscription, timer, Subject } from 'rxjs';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { TimeSegment } from '../timelog/time-segment.model';
import { ITimeSegmentTile } from './time-segment-tile.interface';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }

  faSpinner = faSpinner;
  faCalendar = faCalendarAlt;
  ifCalendarInside: boolean = false;


  ifLoading: boolean = true;


  /* bed time is the time you start trying to go to sleep */
  /* fall asleep time is the time that you are aiming to be sleeping by */
  wakeUpTomorrowTime: moment.Moment;
  bedTime: moment.Moment;
  fallAsleepTime: moment.Moment;




  daybookBodyStyle: any = {};
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

  bedTimeStyle: any = {};
  bedTimeString: string = "";
  ifBedTime: boolean = false;

  nowSubscription: Subscription = new Subscription();
  fetchTimeSegmentsSubscription: Subscription = new Subscription();

  timeSegmentTiles: ITimeSegmentTile[] = [];
  nextTimeSegmentTile: ITimeSegmentTile = null;

  timeSegmentFormContainer: any = null;





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

  ngOnInit() {

    this.dayStartTime = moment(this.currentDate).hour(7).minute(30).second(0).millisecond(0);
    this.dayEndTime = moment(this.currentDate).hour(22).minute(30).second(0).millisecond(0);

    this.buildDisplay(this.dayStartTime, this.dayEndTime);
    this.ifLoading = false;

    this.nowSubscription.unsubscribe();
    this.fetchTimeSegmentsSubscription.unsubscribe();

    this._currentDate$.subscribe((date) => {
      let dayStartTime = moment(date).hour(7).minute(30).second(0).millisecond(0);
      let dayEndTime = moment(date).hour(22).minute(30).second(0).millisecond(0);
      this.buildDisplay(dayStartTime, dayEndTime);

      this.nowSubscription.unsubscribe();
      this.nowSubscription = timer(0, 60000).subscribe(() => {
        this.fetchTimeSegmentsSubscription.unsubscribe();
        this.fetchTimeSegmentsSubscription = this.timeLogService.fetchTimeSegmentsByDay(date).subscribe((timeSegments) => {
          this.timeSegments = timeSegments;
          this.displayTimeSegments(this.timeSegments);
          this.displayNextTimeSegment(this.timeSegments);

          


          this.ifLoading = false;
        });
        this.buildDisplay(dayStartTime, dayEndTime);
      })

    })

    this.currentDate = moment();


  }


  displayNextTimeSegment(timeSegments: TimeSegment[]){
    if (moment(this.currentDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      let lastEndTime = this.getLastEndTime(timeSegments);
      if(moment().diff(lastEndTime, 'minutes') > 5){
        let nextTimeSegment: TimeSegment = new TimeSegment('NEXT_TIME_SEGMENT', '', lastEndTime, moment().toISOString())
        this.nextTimeSegmentTile = this.drawTimeSegmentTile(nextTimeSegment);
      }else{
        this.nextTimeSegmentTile = null;
      }
    }else{
      this.nextTimeSegmentTile = null;
    }
  }

  drawTimeSegmentTile(timeSegment: TimeSegment): ITimeSegmentTile {
    let tile: ITimeSegmentTile = null;
    let segmentStart: moment.Moment = moment(timeSegment.startTime);
    let segmentEnd: moment.Moment = moment(timeSegment.endTime);
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

    console.log(this.bookLines[0].startTime.format('YYYY-MM-DD h:mm a'))

    /*
      getting "lineEnd is undefined"
      
      need to set some parameters.


      perhaps here is a good place to implement the long-scrolling daybook, where a window of some size is available, e.g., 12 hours, 14 hours, 16 hours, however the person wants 
      to customize it.  maybe default of 14 or 16 hours

      then, load the entire thing but make it hidden behind the rest of the app and scrollable



    */

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

    if(lineEnd == null){
      console.log("its null", timeSegment.startTime.format('h:mm a'), timeSegment.endTime.format('h:mm a'))
      console.log(timeSegment);
      console.log(this.bookLines);
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
      tiles.push(this.drawTimeSegmentTile(timeSegment));
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
        this.ifNowLine = false;
        nowLineContainerStyle = { "display": "none" };
        nowTimeContainerStyle = { "display": "none" };
      } else {
        if (moment(now).isAfter(currentTime) && moment(now).isSameOrBefore(segmentEnd)) {
          nowLineContainerStyle = { "grid-row": "" + gridIndex + " / span 1", "grid-template-rows": getGridTemplateRowsStyle(now, currentTime, 1) };
          nowTimeContainerStyle = { "grid-row": "" + (gridIndex - 1) + " / span 3", "grid-column": "1 / span 2", "grid-template-rows": getGridTemplateRowsStyle(now, moment(currentTime).subtract(30, 'minutes'), 3) };
          this.ifNowLine = true;
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

    this.daybookBodyStyle = { "grid-template-rows": "repeat(" + gridIndex.toFixed(0) + ", 1fr)" }
    this.hourLabels = hourLabels;
    this.bookLines = gridLines;

    this.nowLineContainerStyle = nowLineContainerStyle;
    this.nowTimeContainerStyle = nowTimeContainerStyle;
    this.nowTime = now;


    // this.bedTimeString = this.calculateBedTimeString(now);

    // this.bedTimeStyle = bedTimeStyle;
  }


  getLastEndTime(timeSegments: TimeSegment[]): string {
    let latestTime = moment(timeSegments[0].endTime);
    for (let timeSegment of timeSegments) {
      if (moment(timeSegment.endTime).isAfter(latestTime)) {
        latestTime = moment(timeSegment.endTime);
      }
    }
    return latestTime.toISOString();
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




  onClickNextTimeSegment(timeSegment: TimeSegment) {
    console.log("timeSegment", timeSegment);
  }


  // calculateBedTimeString(now: moment.Moment): string {
  //   let minutes = Math.abs(Math.floor(moment(now).diff(moment(this.bedTime), 'minutes')));
  //   let hours = Math.floor(minutes / 60)
  //   minutes = minutes - (hours * 60);

  //   if (moment(now).isBefore(moment(this.bedTime).subtract(3, 'hours'))) {
  //     return "Bed time: " + moment(this.bedTime).format('hh:mm a');
  //   } else if (moment(now).isBefore(moment(this.bedTime).subtract(1, 'minutes'))) {
  //     if (hours > 0 && minutes > 0) {
  //       return hoursString(hours) + " and " + minutesString(minutes) + " until bed time";
  //     } else if (minutes > 0) {
  //       return minutesString(minutes) + " until bed time";
  //     } else if (hours > 0) {
  //       return hoursString(hours) + " until bed time";
  //     }
  //   } else if (moment(now).isAfter(moment(this.bedTime).subtract(1, 'minutes')) && moment(now).isBefore(moment(this.bedTime).add('1 minutes'))) {
  //     return "It's bedtime.  Go to bed";
  //   } else {
  //     if (hours > 0 && minutes > 0) {
  //       return "It's " + hoursString(hours) + " and " + minutesString(minutes) + " past bed time.  Go to bed.";
  //     } else if (minutes > 0) {
  //       return "It's " + minutesString(minutes) + " past bed time.  Go to bed.";
  //     } else if (hours > 0) {
  //       return "It's " + hoursString(hours) + " past bed time.  Go to bed.";
  //     }
  //   }



  //   function minutesString(minutes: number): string {
  //     if (minutes == 0) {
  //       return "";
  //     } else if (minutes == 1) {
  //       return "1 minute";
  //     } else {
  //       return "" + minutes + " minutes";
  //     }
  //   }
  //   function hoursString(hours: number): string {
  //     if (hours == 0) {
  //       return "";
  //     } else if (hours == 1) {
  //       return "1 hour";
  //     } else {
  //       return "" + hours + " hours";
  //     }
  //   }


  // }

  ngOnDestroy() {
    this.fetchTimeSegmentsSubscription.unsubscribe();
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
