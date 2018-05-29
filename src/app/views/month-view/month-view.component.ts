import { TimeService } from './../../services/time.service';
import { Component, OnInit } from '@angular/core';
import { Day } from './day.model';


@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.css']
})
export class MonthViewComponent implements OnInit {

  
  viewBox: string;
  viewBoxHeight: Number;
  viewBoxWidth: Number;
  now: Date;


  days: Day[];

  constructor(private timeService: TimeService) { }

  ngOnInit() {
    this.viewBoxHeight = 600;
    this.viewBoxWidth = 800;
    this.viewBox = "0 0 "+this.viewBoxWidth+" "+this.viewBoxHeight;
    this.days = this.calculateDays(this.viewBoxHeight, this.viewBoxWidth);
    this.now = this.timeService.getDate();
  }

  calculateDays(viewBoxHeight, viewBoxWidth): Day[] {
    let now: Date = this.timeService.getDate();
    let firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1 );
    let lastOfMonth = new Date(now.getFullYear(), now.getMonth()+1, 0);
    let currentDate: Date = firstOfMonth;
    let columns = 7;
    let rows = Math.ceil((lastOfMonth.getDate()+firstOfMonth.getDay())/columns);

    let padding = 10;
    let dayWidth = (viewBoxWidth - (padding*(columns+1))) / columns;
    let dayHeight = (viewBoxHeight - (padding*(rows+1))) / rows;

    let days: Day[] = [];

    for(let row = 0; row < rows; row++){
      for(let col = 0; col < columns; col++){
        if(currentDate === firstOfMonth){
          col = currentDate.getDay();
        }
        let x = padding + (col*dayWidth) + (col*padding);
        let y = padding + (row*dayHeight) + (row*padding);
        let path = 'M'+x+' '+y+
          ' L'+x+' '+(y+dayHeight)+
          ' L'+(x+dayWidth)+' '+(y+dayHeight)+
          ' L'+(x+dayWidth)+' '+y+
          ' Z'+
          ''
        let day: Day = {
          date: currentDate,
          dateYYYYMMDD: this.timeService.static_yyyymmdd(currentDate),
          svgPath: path,
          style: {
            "fill":"#f9f9f9",
            "stroke":"none"
          }
        }
        if(currentDate.getMonth() === lastOfMonth.getMonth())
          days.push(day);

        let nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        currentDate = nextDate;

        
        
      }
    }
    return days;
  }

  onClick(day: Day){
    console.log(day);
  }
  onMouseEnter(day: Day){
    day.style = {
      "fill":"#f9f9f9",
      "stroke":"blue",
      "cursor":"pointer"
    }
  }
  onMouseLeave(day: Day){
    day.style = {
      "fill":"#f9f9f9",
      "stroke":"none"
    }
  }

}
