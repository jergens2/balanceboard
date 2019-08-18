import { Component, OnInit, Input } from '@angular/core';
import { TimeViewsService } from './time-views.service';
import * as moment from 'moment';

import { TimeViewConfiguration } from './time-view-configuration.interface';
import { TimeViewDayData } from './time-view-day-data-interface';

@Component({
  selector: 'app-time-views',
  templateUrl: './time-views.component.html',
  styleUrls: ['./time-views.component.css']
})
export class TimeViewsComponent implements OnInit {

  constructor(private timeViewsService: TimeViewsService) { }


  @Input() configuration: TimeViewConfiguration;

  timeView: string = "YEAR";
  customViewTimeRange: any = null;
  // 'DAY', 'WEEK', 'SIX_WEEKS', 'YEAR', 'MULTIPLE_YEARS'

  rangeStartDate: moment.Moment;
  rangeEndDate: moment.Moment;
  rangeDayCount: number = 0;

  ngOnInit() {

    // if(this.configuration){
    //   console.log("Configuration:", this.configuration);
    // }else{
    //   console.log("No configuration was provided.")
    // }
  }

  onDateClicked(day: TimeViewDayData){
    console.log("Date clicked: ", day);
  }


  onClickZoom(zoomLevel: string){
    this.timeView = zoomLevel;
  }


}
