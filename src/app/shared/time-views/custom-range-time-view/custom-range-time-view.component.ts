import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { TimeViewsService } from '../time-views.service';

import { TimeViewConfiguration } from '../time-view-configuration.interface';

@Component({
  selector: 'app-custom-range-time-view',
  templateUrl: './custom-range-time-view.component.html',
  styleUrls: ['./custom-range-time-view.component.css']
})
export class CustomRangeTimeViewComponent implements OnInit {

  constructor(private timeViewsService: TimeViewsService) { }

  @Input() timeRange: {startDate: moment.Moment, endDate: moment.Moment};
  @Input() configuration: TimeViewConfiguration;
  rangeStartDate: moment.Moment;
  rangeEndDate: moment.Moment;

  totalDays: number = 0;



  ngOnInit() {
    this.rangeStartDate = moment(this.timeRange.startDate);
    this.rangeEndDate = moment(this.timeRange.endDate);
    this.totalDays = this.rangeEndDate.diff(this.rangeStartDate, "days") + 1;

    console.log("total days is ", this.totalDays);
  }

}
