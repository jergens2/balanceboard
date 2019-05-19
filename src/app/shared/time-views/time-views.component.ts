import { Component, OnInit, Input } from '@angular/core';
import { TimeViewsService } from './time-views.service';
import * as moment from 'moment';

@Component({
  selector: 'app-time-views',
  templateUrl: './time-views.component.html',
  styleUrls: ['./time-views.component.css']
})
export class TimeViewsComponent implements OnInit {

  constructor(private timeViewsService: TimeViewsService) { }



  @Input() timeViewData: any;

  timeView: string = "YEAR";
  customViewTimeRange: any = null;
  // 'DAY', 'WEEK', 'SIX_WEEKS', 'YEAR', 'MULTIPLE_YEARS'

  rangeStartDate: moment.Moment;
  rangeEndDate: moment.Moment;
  rangeDayCount: number = 0;

  ngOnInit() {
    this.timeViewsService.currentDayDataRange$.subscribe((range)=>{
      if(range != null){
        console.log("range is ", range)
        this.customViewTimeRange = range;
        this.timeView = "CUSTOM";
      }
      // this.rangeStartDate = moment(range.startDate);
      // this.rangeEndDate = moment(range.endDate);
      // this.rangeDayCount = this.rangeEndDate.diff(this.rangeStartDate, "days") + 1;

      // if(this.rangeDayCount == 1){
      //   this.timeView = "DAY";
      // }else if(this.rangeDayCount > 1 && this.rangeDayCount <= 7){
      //   this.timeView = "WEEK";
      // }else if(this.rangeDayCount > 7 && this.rangeDayCount <= 42){
      //   this.timeView = "SIX_WEEKS";
      // }else if(this.rangeDayCount > 42 && this.rangeDayCount <= 366){
      //   this.timeView = "YEAR";
      // }else{
      //   this.timeView = "MULTIPLE_YEARS";
      // }



    })
  }


  onClickZoom(zoomLevel: string){
    this.timeView = zoomLevel;
  }


}
