import { Component, OnInit } from '@angular/core';
import { TimelogService } from './timelog.service';
import { TimeMark } from './time-mark.model';
import { FormGroup, FormControl } from '@angular/forms';
import { faTimes, faCog } from '@fortawesome/free-solid-svg-icons';

import * as moment from 'moment';

export interface ITimeMarkTile {
  timeMark: TimeMark,
  style: Object,
  deleteButtonIsVisible: boolean
}

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.css']
})

export class TimelogComponent implements OnInit {

  /*
    Note about time versus ISO time
    Pacific Standard Time (PST) is UTC-8 on standard time, which is between November and March, 
    Pacific Daylight Time (PDT) is UTC-7 (also known as Daylight Savings Time), between March and November

    So depending on when you are checking, from the perspective in this time zone, the UTC time is always either 7 or 8 hours ahead, or more accurrately we are 7 or 8 hours behind.

    UTC                           - PDT
    "2018-10-25T07:00:00.000Z"    - 2018-10-25 00:00
    "2018-10-25T08:00:00.000Z"    - 2018-10-25 01:00
    "2018-10-25T09:00:00.000Z"    - 2018-10-25 02:00
    "2018-10-25T10:00:00.000Z"    - 2018-10-25 03:00
    "2018-10-25T11:00:00.000Z"    - 2018-10-25 04:00
    "2018-10-25T12:00:00.000Z"    - 2018-10-25 05:00
    "2018-10-25T13:00:00.000Z"    - 2018-10-25 06:00
    "2018-10-25T14:00:00.000Z"    - 2018-10-25 07:00
    "2018-10-25T15:00:00.000Z"    - 2018-10-25 08:00
    "2018-10-25T16:00:00.000Z"    - 2018-10-25 09:00
    "2018-10-25T17:00:00.000Z"    - 2018-10-25 10:00
    "2018-10-25T18:00:00.000Z"    - 2018-10-25 11:00
    "2018-10-25T19:00:00.000Z"    - 2018-10-25 12:00
    "2018-10-25T20:00:00.000Z"    - 2018-10-25 13:00
    "2018-10-25T21:00:00.000Z"    - 2018-10-25 14:00
    "2018-10-25T22:00:00.000Z"    - 2018-10-25 15:00
    "2018-10-25T23:00:00.000Z"    - 2018-10-25 16:00
    "2018-10-26T00:00:00.000Z"    - 2018-10-25 17:00
    "2018-10-26T01:00:00.000Z"    - 2018-10-25 18:00
    "2018-10-26T02:00:00.000Z"    - 2018-10-25 19:00
    "2018-10-26T03:00:00.000Z"    - 2018-10-25 20:00
    "2018-10-26T04:00:00.000Z"    - 2018-10-25 21:00
    "2018-10-26T05:00:00.000Z"    - 2018-10-25 22:00
    "2018-10-26T06:00:00.000Z"    - 2018-10-25 23:00

    all values stored in DB are in UTC time and when retreived come in UTC time.

    So our function must know this, in order to properly display "Todays time entries" meaning the 24 hour period which refers to the same single day number of the month, relative to the user.

    Client side gets moment() to get todays date.
    we are then looking for all time marks which would be between the hours of 00:00 and 23:59:59.9999 for the relative date of the client.

    Ultimately would we not want to store the timezone data in the DB as well and just do the conversion clientside?
  */

  /*
    Issues:

    -time marks can be specified for any time.  this means at 1:00pm you can add a time mark that is marked at 4:00pm, then 2 minutes later mark another time mark 
      that makes 1:02pm, and you would have time marks that are out of chronological order.
      -do what about this?  make it so users cannot specify the time of the time mark? - maybe an override button - by default time mark time is greyed out but can be overridden if user wants to
      -then sort all time marks by chronological order?
        -now you get overlapping timemarks? do time marks need a start and an end, and the start should be the equivalent of the end of the previous one?
          so if you make a time mark for 4:00pm at 1:00pm, then presumably that time mark *spans* from a start of 1:00pm to an end of 4:00pm, so that time is already
          being accounted for... should you be able to add another timemark earlier than 4:00pm?
    
    -When adding an activity, should the "Save time mark" button disappear until you are finalized with the activity form ?

    -b
    
    -c
  */

  /*
    Features to add:

    new time mark form:

    -creating a new time mark, and there may or may not be time marks prior to this one
    form asks: "time mark spans from?" and options can be: "since previous time mark", "for the last X minutes", 
      activities within this time mark can be similar 
        -activity a spans from?: duration of 20 minutes
        -activity b spans from?: 30 percent of the duration of this time mark span
        -activity c spans from?: auto-calculate the remainder of that time

    -adding activities:
    instead of a button to add activity, perhaps just a text input box and when you type in the input box it automatically starts predicting the activity which you 
    were about to add.  and then as you add activities in the text box they get delineated as a distinct variable and has a color highlight for example


    maybe some kind of representation proportionally over the last 24 hours what these activities look to with respect to size in a kind of rectangular shape thing representing 24 hours
    kind of like how in Visual Studio Code, the bar on the far right kind of gives you a zoomed out visual representation of the entire document.
  */

  constructor(private timeLogService: TimelogService) { }

  private currentDate: moment.Moment;

  faTimes = faTimes;
  faCog = faCog;

  loadingTimeMarks: boolean = true;
  addTimeMarkForm: boolean = false;

  private thisDaysTimeMarks: TimeMark[];

  private allTimeMarks: TimeMark[];

  thisDayCardStyle = {};

  timeMarkTiles: ITimeMarkTile[] = [];
  private defaultTimeMarkTileStyle: Object;


  ngOnInit() {

    this.defaultTimeMarkTileStyle = {};
    this.currentDate = moment();

    this.timeLogService.currentDate.subscribe((currentDate: moment.Moment) => {
      this.currentDate = currentDate;
      this.updateThisDaysTimeMarks(this.currentDate);
    })

    this.timeLogService.timeMarks.subscribe((timeMarks: TimeMark[]) => {
      this.allTimeMarks = timeMarks;
      this.loadingTimeMarks = false;
      this.updateThisDaysTimeMarks(this.currentDate);
    });
  }

  get thisDate(): string {
    return this.currentDate.format('YYYY-MM-DD');
  }
  get thisDatePlusOne(): string {
    return moment(this.currentDate).add(1, 'days').format('YYYY-MM-DD');
  }
  get thisDateMinusOne(): string {
    return moment(this.currentDate).subtract(1, 'days').format('YYYY-MM-DD');
  }

  onClickNewTimeMark() {
    this.addTimeMarkForm = true;
  }
  onCloseForm(event) {
    this.addTimeMarkForm = false;
  }

  private updateThisDaysTimeMarks(thisDate: moment.Moment) {
    this.thisDaysTimeMarks = this.getThisDaysTimeMarks(this.currentDate, this.allTimeMarks);
    this.timeMarkTiles = this.buildTimeMarkTiles(this.thisDaysTimeMarks);
    if (moment().format('YYYY-MM-DD') == thisDate.format('YYYY-MM-DD')) {
      this.thisDayCardStyle = {
        'border': '1px solid green',
      }
    } else {
      this.thisDayCardStyle = {
        'border': '1px solid gray',
      }
    }
  }

  private buildTimeMarkTiles(timeMarks: TimeMark[]): ITimeMarkTile[] {
    let timeMarkTiles: ITimeMarkTile[] = [];
    for (let timeMark of timeMarks) {
      let timeMarkTile: ITimeMarkTile = { timeMark: timeMark, style: this.defaultTimeMarkTileStyle, deleteButtonIsVisible: false };
      timeMarkTiles.push(timeMarkTile);
    }
    return timeMarkTiles;
  }

  private getThisDaysTimeMarks(thisDay: moment.Moment, timeMarks: TimeMark[]): TimeMark[] {
    let thisDaysTimeMarks: TimeMark[] = [];
    if (timeMarks) {
      for (let timeMark of timeMarks) {
        /*
          2018-11-23:
          moment(undefined) produces the same result as moment().
          therefore, if we pass it something that looks like this(moment(timeMark.startTimeISO)) where startTimeISO is undefined,
          then it will just use todays date which causes problems for these purposes.

          so we have to check that start time is defined.
        */
        if(timeMark.startTimeISO){
          let isStartTimeToday: boolean = moment(timeMark.startTimeISO).local().format('YYYY-MM-DD') == moment(thisDay).format('YYYY-MM-DD');
          let isEndTimeToday: boolean = moment(timeMark.endTimeISO).local().format('YYYY-MM-DD') == moment(thisDay).format('YYYY-MM-DD');
          if (isStartTimeToday || isEndTimeToday) {
            thisDaysTimeMarks.push(timeMark);
          }
        }else{
          console.log("time mark startTime is not defined.", timeMark)
        }

        
      }
    }
    return thisDaysTimeMarks;
  }

  onMouseEnterTimeMarkTile(timeMarkTile: ITimeMarkTile) {
    timeMarkTile.deleteButtonIsVisible = true;
  }

  onMouseLeaveTimeMarkTile(timeMarkTile: ITimeMarkTile) {
    timeMarkTile.deleteButtonIsVisible = false;
  }

  onClickDeleteTimeMark(timeMark: TimeMark) {
    //to do:  when clicked, prompt for a confirmation:  "Delete this time mark?"
    this.timeLogService.deleteTimeMark(timeMark);
  }

  onClickAdjacentDate(dateYYYYMMDD: string) {
    this.timeLogService.setCurrentDate(moment(dateYYYYMMDD));
    //this.updateThisDaysTimeMarks(moment(dateYYYYMMDD));
  }

  dateNotGreaterThanToday(dateYYYYMMDD: string): boolean {
    if (moment().format('YYYY-MM-DD') < moment(dateYYYYMMDD).format('YYYY-MM-DD')) {
      return false;
    } else {
      return true;
    }
  }

  dateRelevanceToTodayString(dateYYYYMMDD: string): string {
    //Used by the template to input any date and return a colloquialism relative to Today
    if (moment(dateYYYYMMDD).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      return "Today";
    } else if (moment(dateYYYYMMDD).format('YYYY-MM-DD') == moment().add(1, 'days').format('YYYY-MM-DD')) {
      return "Tomorrow";
    } else if (moment(dateYYYYMMDD).format('YYYY-MM-DD') == moment().add(-1, 'days').format('YYYY-MM-DD')) {
      return "Yesterday";
    } else if (moment(dateYYYYMMDD).isBefore(moment().startOf('day'))) {
      let duration = moment.duration(moment().startOf('day').diff(dateYYYYMMDD));
      let days = duration.asDays().toFixed(0);
      return "" + days + " days ago";
    } else if (moment(dateYYYYMMDD).isAfter(moment().endOf('day'))) {
      let duration = moment.duration(moment(dateYYYYMMDD).diff(moment().startOf('day')));
      let days = duration.asDays().toFixed(0);
      return "" + days + " days from today";
    }
  }

  getFormattedDateString(dateYYYYMMDD: string): string {
    //Used by template to input any date and receive back a formatted date string 
    return moment(dateYYYYMMDD).format('dddd, MMMM Do, gggg');
  }

  dateIsToday(dateYYYYMMDD: string): boolean {
    //Used by template to check if provided date string is Today
    return (moment().format('YYYY-MM-DD') == dateYYYYMMDD);
  }

}
