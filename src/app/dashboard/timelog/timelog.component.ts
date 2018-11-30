import { Component, OnInit } from '@angular/core';
import { TimelogService } from './timelog.service';
import { TimeMark } from './time-mark.model';
import { faTimes, faCog, faArrowCircleRight, faArrowCircleLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

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

  
  constructor(private timeLogService: TimelogService) { }

  private currentDate: moment.Moment;

  faTimes = faTimes;
  faCog = faCog;
  faArrowCircleRight = faArrowCircleRight;
  faArrowCircleLeft = faArrowCircleLeft;
  faSpinner = faSpinner;

  ifLoadingTimeMarks: boolean;
  addTimeMarkForm: boolean = false;

  private thisDaysTimeMarks: TimeMark[];

  // private allTimeMarks: TimeMark[];

  thisDayCardStyle = {};

  timeMarkTiles: ITimeMarkTile[] = [];
  private defaultTimeMarkTileStyle: Object;


  ngOnInit() {
    this.ifLoadingTimeMarks = true;
    this.defaultTimeMarkTileStyle = {};
    this.currentDate = moment();

    this.timeLogService.currentDate$.subscribe((currentDate: moment.Moment) => {
      this.currentDate = currentDate;
      // this.allTimeMarks = this.timeLogService.timeMarks;
      // this.updateThisDaysTimeMarks(this.currentDate);
    })

    this.timeLogService.timeMarks$.subscribe((timeMarks: TimeMark[]) => {
      if(timeMarks != null){
        console.log("subscription thing", timeMarks)
        // this.allTimeMarks = timeMarks;
        // this.updateThisDaysTimeMarks(this.currentDate);
        this.timeMarkTiles = this.buildTimeMarkTiles(timeMarks);
        this.ifLoadingTimeMarks = false;
      }
      
    });
  }

  get latestTimeMark(): TimeMark{
    return this.timeLogService.latestTimeMark;
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
  onCloseForm() {
    this.addTimeMarkForm = false;
  }

  // private updateThisDaysTimeMarks(thisDate: moment.Moment) {
  //   this.thisDaysTimeMarks = this.getThisDaysTimeMarks(this.currentDate, this.allTimeMarks);
  //   this.timeMarkTiles = this.buildTimeMarkTiles(this.thisDaysTimeMarks);
  //   if (moment().format('YYYY-MM-DD') == thisDate.format('YYYY-MM-DD')) {
  //     this.thisDayCardStyle = {
  //       'border': '1px solid green',
  //     }
  //   } else {
  //     this.thisDayCardStyle = {
  //       'border': '1px solid gray',
  //     }
  //   }
  // }

  private buildTimeMarkTiles(timeMarks: TimeMark[]): ITimeMarkTile[] {
    let timeMarkTiles: ITimeMarkTile[] = [];
    for (let timeMark of timeMarks) {
      let timeMarkTile: ITimeMarkTile = { timeMark: timeMark, style: this.defaultTimeMarkTileStyle, deleteButtonIsVisible: false };
      timeMarkTiles.push(timeMarkTile);
    }
    return timeMarkTiles;
  }

  // private getThisDaysTimeMarks(thisDay: moment.Moment, timeMarks: TimeMark[]): TimeMark[] {
  //   let thisDaysTimeMarks: TimeMark[] = [];
  //   if (timeMarks) {
  //     for (let timeMark of timeMarks) {
  //       /*
  //         2018-11-23:
  //         moment(undefined) produces the same result as moment().
  //         therefore, if we pass it something that looks like this(moment(timeMark.startTimeISO)) where startTimeISO is undefined,
  //         then it will just use todays date which causes problems for these purposes.

  //         so we have to check that start time is defined.
  //       */
  //       if(timeMark.startTimeISO){
  //         let isStartTimeToday: boolean = moment(timeMark.startTimeISO).local().format('YYYY-MM-DD') == moment(thisDay).format('YYYY-MM-DD');
  //         let isEndTimeToday: boolean = moment(timeMark.endTimeISO).local().format('YYYY-MM-DD') == moment(thisDay).format('YYYY-MM-DD');
  //         if (isStartTimeToday || isEndTimeToday) {
  //           thisDaysTimeMarks.push(timeMark);
  //         }
  //       }else{
  //         console.log("time mark startTime is not defined.", timeMark)
  //       }

        
  //     }
  //   }
  //   return thisDaysTimeMarks;
  // }

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
    this.timeMarkTiles = null;
    this.ifLoadingTimeMarks = true;
    this.timeLogService.setCurrentDate(moment(dateYYYYMMDD));
    this.onCloseForm();
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

  dayOfWeek(dateYYYYMMDD: string): string {
    return moment(dateYYYYMMDD).format('dddd');
  }
  dayOfMonth(dateYYYYMMDD: string): string {
    return moment(dateYYYYMMDD).format('MMM Do');
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
