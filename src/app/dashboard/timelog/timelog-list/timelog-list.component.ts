import { Component, OnInit } from '@angular/core';
import { ITimeMarkTile } from './timeMarkTile.interface';
import { TimelogService } from '../timelog.service';
import { TimeMark } from '../time-mark.model';

import { faSpinner, faCog, faTimes } from '@fortawesome/free-solid-svg-icons';

import * as moment from 'moment';


@Component({
  selector: 'app-timelog-list',
  templateUrl: './timelog-list.component.html',
  styleUrls: ['./timelog-list.component.css']
})
export class TimelogListComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }

  timeMarkTiles: ITimeMarkTile[] = [];
  ifLoadingTimeMarks: boolean;

  ifAddTimeMarkButton: boolean = true;
  ifAddTimeMarkForm: boolean;

  faSpinner = faSpinner;
  faCog = faCog;
  faTimes = faTimes;

  currentDate: moment.Moment;

  private defaultTimeMarkTileStyle: Object;

  ngOnInit() {
    this.currentDate = moment();
    this.ifLoadingTimeMarks = true;
    this.ifAddTimeMarkButton = true;
    this.defaultTimeMarkTileStyle = {};

    this.timeLogService.currentDate$.subscribe((date) => {
      this.currentDate = date;
    })

    this.timeLogService.thisDaysTimeMarks.subscribe((timeMarks: TimeMark[]) => {
      this.timeMarkTiles = this.buildThisDaysTimeMarkTiles(timeMarks);
      this.ifLoadingTimeMarks = false;
    })

  }

  private buildThisDaysTimeMarkTiles(timeMarks: TimeMark[]): ITimeMarkTile[] {

    let timeMarkTiles: ITimeMarkTile[] = [];
    for (let timeMark of timeMarks) {
      let timeMarkTile: ITimeMarkTile = { timeMark: timeMark, style: this.defaultTimeMarkTileStyle, deleteButtonIsVisible: false };
      timeMarkTiles.push(timeMarkTile);
    }
    return timeMarkTiles;
  }




  /*
      TEMPLATE FUNCTIONS
  */

  ifDateIsTodate(date: moment.Moment){
    console.log(date);
    if(moment(date).dayOfYear() == moment().dayOfYear()){
      return true;
    }else{
      return false;
    }
  }

  onClickAddTimeMark() {
    this.ifAddTimeMarkButton = false;
    this.ifAddTimeMarkForm = true;
  }

  onCloseForm(){
    this.ifAddTimeMarkForm = false;
    this.ifAddTimeMarkButton = true;
  }

  onMouseEnterTimeMarkTile(timeMarkTile: ITimeMarkTile) {

    // timeMarkTile.deleteButtonIsVisible = true;
  }

  onMouseLeaveTimeMarkTile(timeMarkTile: ITimeMarkTile) {
    // timeMarkTile.deleteButtonIsVisible = false;
  }

  onClickDeleteTimeMark(timeMark: TimeMark) {
    //to do:  when clicked, prompt for a confirmation:  "Delete this time mark?"
    this.timeLogService.deleteTimeMark(timeMark);
  }

  dateIsToday(dateYYYYMMDD: string): boolean {
    //Used by template to check if provided date string is Today
    return (moment().format('YYYY-MM-DD') == dateYYYYMMDD);
  }

}
