import { Component, OnInit } from '@angular/core';
import { TimelogService } from './timelog.service';
import { TimeMark } from './time-mark.model';
import { FormGroup, FormControl } from '@angular/forms';

import * as moment from 'moment';
import { CategorizedActivity } from './categorized-activity.model';
import { Observable, fromEvent } from 'rxjs';

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


  headerDates: {
    thisDate: string,
    thisDateMinusOne: string,
    thisDatePlusOne: string
  };

  categorizedActivities: CategorizedActivity[] = [
    {
      id: '',
      name: "Overwatch",
      description: "Overwatch PC video game",
      color: "#f8a01b",
      icon: ''
    },
    {
      id: '',
      name: "Reddit",
      description: "Browse Reddit",
      color: "#ff6435",
      icon: ''
    },
    {
      id: '',
      name: "CSC - NSD",
      description: "Working for Correctional Service of Canada - National IT Service Desk",
      color: "#2f54f9",
      icon: ''
    },
    {
      id: '',
      name: "Walk Dogs",
      description: "Take the dogs for a walk",
      color: "#1da529",
      icon: ''
    }
  ];

  categorizedActivitiesSearchResults: CategorizedActivity[] = [];
  activityNameInputValue = '';

  loadingTimeMarks: boolean = true;
  addTimeMarkForm: boolean = false;
  ifAddActivity: boolean = true;
  private thisDaysTimeMarks: TimeMark[];

  private allTimeMarks: TimeMark[];
  timeMarkForm: FormGroup;
  newActivityForm: FormGroup;
  thisDayCardStyle = {};

  newCategorizedActivity: boolean = false;
  timeMarkActivities: CategorizedActivity[] = [];
  


  timeMarkTiles: ITimeMarkTile[] = [];
  private defaultTimeMarkTileStyle: Object;


  ngOnInit() {
    this.headerDates = this.setHeaderDates(moment().format('YYYY-MM-DD'));
    this.defaultTimeMarkTileStyle = {};

    this.timeLogService.timeMarks.subscribe((timeMarks: TimeMark[]) => {
      this.allTimeMarks = timeMarks;
      this.updateThisDaysTimeMarks(moment(this.headerDates.thisDate));
      this.loadingTimeMarks = false;
    });

  }

  private updateThisDaysTimeMarks(thisDate: moment.Moment) {
    this.headerDates = this.setHeaderDates(moment(thisDate).format('YYYY-MM-DD'));
    this.thisDaysTimeMarks = this.getThisDaysTimeMarks(moment(this.headerDates.thisDate), this.allTimeMarks);
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

  private setHeaderDates(focusDateYYYYMMDD: string) {
    return {
      thisDate: moment(focusDateYYYYMMDD).format('YYYY-MM-DD'),
      thisDateMinusOne: moment(focusDateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'),
      thisDatePlusOne: moment(focusDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'),
    };
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

    // const utcOffsetMinutes = moment().utcOffset();

    // const utcOffsetStart = moment(today).hour(0).minute(utcOffsetMinutes).second(0).millisecond(0);
    // const utcOffsetEnd =   moment(today).hour(23).minute(59+utcOffsetMinutes).second(59).millisecond(999);

    let thisDaysTimeMarks: TimeMark[] = [];
    for (let timeMark of timeMarks) {
      if (timeMark.time.local().format('YYYY-MM-DD') == moment(thisDay).format('YYYY-MM-DD')) {
        thisDaysTimeMarks.push(timeMark);
      }
    }

    return thisDaysTimeMarks;
  }

  buildActivityForm() {

    this.newActivityForm = new FormGroup({
      'name': new FormControl(null),
      'description': new FormControl(null),
      'color': new FormControl('blue')
    })
  }

  buildTimeMarkForm() {
    this.timeMarkForm = new FormGroup({
      'time': new FormControl(moment().format('HH:mm').toString()),
      // 'title': new FormControl(),
      'description': new FormControl(),
    });
  }

  toggleTimeMarkForm() {
    this.addTimeMarkForm = !this.addTimeMarkForm;
    this.buildTimeMarkForm();
  }

  onClickAddActivity() {
    this.newCategorizedActivity = true;
    this.ifAddActivity = false;

    this.buildActivityForm();
  }

  onClickCancelActivity() {
    this.newCategorizedActivity = false;
    this.ifAddActivity = true;
  }
  onClickSaveActivity() {
    let activity: CategorizedActivity = new CategorizedActivity();
    //Get form data and build the object.
    activity.name = this.newActivityForm.get('name').value;
    activity.description = this.newActivityForm.get('description').value;
    activity.color = this.newActivityForm.get('color').value
    // activity.childCategoryIds = [];
    // activity.parentId = "";
    activity.icon = "";
    this.timeMarkActivities.push(activity);
    this.newCategorizedActivity = false;
    this.ifAddActivity = true;
  }

  onClickSaveTimeMark() {
    let time = moment(moment().format('YYYY-MM-DD') + ' ' + this.timeMarkForm.get('time').value).toISOString();
    let newTimeMark = new TimeMark(null, null, time);
    newTimeMark.description = this.timeMarkForm.get('description').value;
    newTimeMark.activities = this.timeMarkActivities;

    this.timeMarkActivities = [];

    this.timeLogService.saveTimeMark(newTimeMark);
    this.toggleTimeMarkForm();
    this.timeMarkForm.reset();

    this.buildActivityForm();
    this.buildTimeMarkForm();

  }

  onClickDeleteTimeMark(timeMark: TimeMark) {
    //to add:  when clicked, prompt for a confirmation:  "Delete this time mark?"
    this.timeLogService.deleteTimeMark(timeMark);

  }

  onKeyUpActivityName(event){
    let inputValue = this.newActivityForm.get('name').value;
    this.searchForCategorizedActivities(inputValue);
  } 

  private searchForCategorizedActivities(inputValue: string){
    let searchResults: CategorizedActivity[] = [];
    
    if(inputValue != ""){
      for(let activity of this.categorizedActivities){
        if(activity.name.toLowerCase().match(inputValue.toLowerCase())){
          searchResults.push(activity);
        }
      }
      if(searchResults.length > 0){
        this.activityNameInputValue = "";
      }else{
        this.activityNameInputValue = inputValue;
      }
    }else{
      this.activityNameInputValue = "";
    }
    this.categorizedActivitiesSearchResults = searchResults;
  }

  getActivityNameInputStyle(activity: CategorizedActivity){
    return {'background-color': activity.color};
  }
  onClickActivityNameDropdownItem(activity: CategorizedActivity){
    this.newActivityForm.patchValue({'name':activity.name});
    this.searchForCategorizedActivities('');
  }

  onClickMakeNewCategoryButton(){
    //click make new category button
    // navigate to a new page where you can manage categories

  }

  onMouseEnterTimeMarkTile(timeMarkTile: ITimeMarkTile) {
    timeMarkTile.deleteButtonIsVisible = true;
  }

  onMouseLeaveTimeMarkTile(timeMarkTile: ITimeMarkTile) {
    timeMarkTile.deleteButtonIsVisible = false;
  }

  onClickAdjacentDate(dateYYYYMMDD: string) {
    this.updateThisDaysTimeMarks(moment(dateYYYYMMDD));
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
      let days = duration.asDays();
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
