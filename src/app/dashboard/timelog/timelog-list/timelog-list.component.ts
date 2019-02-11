import { Component, OnInit } from '@angular/core';


import { TimelogService } from '../timelog.service';
import { ActivitiesService } from '../../activities/activities.service';
import { TimeSegment } from '../time-segment.model';
import { ITimeSegmentTile } from './time-segment-tile.interface';

import { faSpinner, faCog, faTimes } from '@fortawesome/free-solid-svg-icons';

import * as moment from 'moment';



@Component({
  selector: 'app-timelog-list',
  templateUrl: './timelog-list.component.html',
  styleUrls: ['./timelog-list.component.css']
})
export class TimelogListComponent implements OnInit {

  constructor(private timeLogService: TimelogService, private activitiesService: ActivitiesService) { }

  timeSegmentTiles: ITimeSegmentTile[] = [];
  ifLoadingTimeSegments: boolean;

  ifAddTimeSegmentButton: boolean = true;
  ifAddTimeSegmentForm: boolean;

  faSpinner = faSpinner;
  faCog = faCog;
  faTimes = faTimes;

  currentDate: moment.Moment;

  private defaultTimeSegmentTileStyle: Object;

  latestTimeSegment: TimeSegment = null;

  ngOnInit() {
    this.currentDate = moment();
    this.ifLoadingTimeSegments = true;
    this.ifAddTimeSegmentButton = true;
    this.defaultTimeSegmentTileStyle = {};

    this.timeLogService.currentDate$.subscribe((changedDate: moment.Moment)=>{
      this.currentDate = moment(changedDate);
      if(moment(this.currentDate).dayOfYear() != moment().dayOfYear()){
        this.onCloseForm();
        this.ifAddTimeSegmentButton = false;
      }else{
        this.ifAddTimeSegmentButton = true;
      }
    })


    this.timeLogService.fetchTimeSegmentsByDay(this.currentDate).subscribe((timeSegments) => {
      this.timeSegmentTiles = this.buildThisDaysTimeSegmentTiles(timeSegments);
      this.ifLoadingTimeSegments = false;

      this.latestTimeSegment = this.findLatestTimeSegment(timeSegments);
    });

  }



  private findLatestTimeSegment(timeSegments): TimeSegment{
    if(timeSegments.length > 0){
      let latestTimeSegment = timeSegments[0];
      for (let timeSegment of timeSegments) {
        if (timeSegment.endTimeISO > latestTimeSegment.endTimeISO) {
          latestTimeSegment = timeSegment;
        }
      }
      // console.log("Service: latest time segment is ", latestTimeSegment);
      return latestTimeSegment;
    }else{
      console.log("latest time segment is null because there are no time segments.");
      return null;
    }
  }

  private buildThisDaysTimeSegmentTiles(timeSegments: TimeSegment[]): ITimeSegmentTile[] {

    let timeSegmentTiles: ITimeSegmentTile[] = [];
    for (let timeSegment of timeSegments) {
      let timeSegmentTile: ITimeSegmentTile = { timeSegment: timeSegment, style: this.defaultTimeSegmentTileStyle, deleteButtonIsVisible: false, ifUpdateTimeSegment: false };
      timeSegmentTiles.push(timeSegmentTile);
    }
    return timeSegmentTiles;
  }

  // get latestTimeSegment(): TimeSegment {
  //   return this.timeLogService.latestTimeSegment;
  // }


  /*
      TEMPLATE FUNCTIONS
  */

  onTimeSegmentUpdated(timeSegment: TimeSegment, ){
    console.log("updating timeSegment", timeSegment);
    this.timeLogService.updateTimeSegment(timeSegment);
  }

  ifDateIsTodate(date: moment.Moment){
    console.log(date);
    if(moment(date).dayOfYear() == moment().dayOfYear()){
      return true;
    }else{
      return false;
    }
  }

  onClickAddTimeSegment() {
    this.ifAddTimeSegmentButton = false;
    this.ifAddTimeSegmentForm = true;
  }

  onCloseForm(){
    this.ifAddTimeSegmentForm = false;
    this.ifAddTimeSegmentButton = true;    
  }
  onCloseUpdateForm(timeSegmentTile: ITimeSegmentTile){
    timeSegmentTile.ifUpdateTimeSegment = false;
  }

  onMouseEnterTimeSegmentTile(timeSegmentTile: ITimeSegmentTile) {

    // timeSegmentTile.deleteButtonIsVisible = true;
  }

  onMouseLeaveTimeSegmentTile(timeSegmentTile: ITimeSegmentTile) {
    // timeSegmentTile.deleteButtonIsVisible = false;
  }

  onClickDeleteTimeSegment(timeSegment: TimeSegment) {
    //to do:  when clicked, prompt for a confirmation:  "Delete this time segment?"
    this.timeLogService.deleteTimeSegment(timeSegment);
  }

  onClickUpdateTimeSegment(timeSegmentTile: ITimeSegmentTile){
    timeSegmentTile.ifUpdateTimeSegment = !timeSegmentTile.ifUpdateTimeSegment;
  }

  dateIsToday(dateYYYYMMDD: string): boolean {
    //Used by template to check if provided date string is Today
    return (moment().format('YYYY-MM-DD') == dateYYYYMMDD);
  }


}
