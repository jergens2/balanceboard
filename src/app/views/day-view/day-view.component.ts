import { TimeService } from './../../services/time.service';
import { TimeSegment } from './time-segment.model';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css']
})
export class DayViewComponent implements OnInit {

  viewBox: string;
  viewBoxHeight: number;
  viewBoxWidth: number;

  timeSegments: TimeSegment[];

  today: moment.Moment;

  constructor(private timeService:TimeService) { }

  ngOnInit() {
    this.viewBoxHeight = 600;
    this.viewBoxWidth = 600;
    this.viewBox = "0 0 "+this.viewBoxWidth+" "+this.viewBoxHeight;
    this.today = this.timeService.getActiveDate();
    this.timeSegments = this.calculateTimeSegments();
  }

  calculateTimeSegments(): TimeSegment[]{

    const padding: number = 10;

    const startHour = 7;
    const endHour = 21;

    const increments = (((endHour + 1) - startHour) * 2) - 1;
    const incrementMinutes = 30;
    const segmentHeight = (this.viewBoxHeight - (padding * 2)) / increments;

    let timeSegments: TimeSegment[] = [];
    let currentHour = startHour;
    let currentTime: moment.Moment = this.today.hours(currentHour);
    currentTime.minutes(0).seconds(0);
  
    for (let increment = 0; increment < increments; increment++){
      let timeSegment: TimeSegment = new TimeSegment();
      
      timeSegment.dateTime = currentTime.toDate();

      timeSegment.line_x1 = 0 + padding;
      timeSegment.line_x2 = this.viewBoxWidth - padding;
      timeSegment.line_y1 = (padding*2) + (increment*segmentHeight);
      timeSegment.line_y2 = timeSegment.line_y1;
      timeSegment.text_x = timeSegment.line_x1;
      timeSegment.text_y = timeSegment.line_y1 - 3;
      if(currentTime.minutes() === 0){
        timeSegment.text_string = currentTime.clone().format('h:mm a');
      }else{
        timeSegment.text_string = "";
      }
      
      timeSegment.style = {
        "stroke":"black",
        "stroke-width":"0.5px",
      }

      timeSegments.push(timeSegment);
      currentTime.add(0.5, 'hours');
    }
    console.log(timeSegments);
    return timeSegments;

  }

}
