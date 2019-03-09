import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-daybook-header',
  templateUrl: './daybook-header.component.html',
  styleUrls: ['./daybook-header.component.css']
})
export class DaybookHeaderComponent implements OnInit {

  faCalendar = faCalendarAlt;
  faBars = faBars;


  @Input() currentDate: moment.Moment; 
  @Output() changedDate: EventEmitter<moment.Moment> = new EventEmitter(); 

  constructor() { }

  ngOnInit() {

  }

  onClickHeaderDate(daysDifference: number) {
    let date = moment(this.currentDate).add(daysDifference, 'days');
    console.log("emitting:  ", date.format('YYYY-MM-DD'))
    this.changedDate.emit(date);
  }


  headerDate(daysDifference: number): string {
    let date = moment(this.currentDate).add(daysDifference, 'days');
    return date.format('MMM Do');

  }
  headerDayRelevance(daysDifference: number): string {
    let date = moment(this.currentDate).add(daysDifference, 'days');

    if (moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      return "Today";
    } else if (moment(date).format('YYYY-MM-DD') == moment().add(1, 'days').format('YYYY-MM-DD')) {
      return "Tomorrow";
    } else if (moment(date).format('YYYY-MM-DD') == moment().subtract(1, 'days').format('YYYY-MM-DD')) {
      return "Yesterday";
    } else {
      return date.format('ddd');
    }

  }

  isToday(daysDifference: number): boolean {
    let date = moment(this.currentDate).add(daysDifference, 'days');
    let isToday: boolean = false;
    if (date.format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      isToday = true;
    }
    return isToday;
  }

}
