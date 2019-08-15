import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';

@Component({
  selector: 'app-calendar-large',
  templateUrl: './calendar-large.component.html',
  styleUrls: ['./calendar-large.component.css']
})
export class CalendarLargeComponent implements OnInit {

  constructor() { }

  @Input() activeDay: DaybookDayItem;

  ngOnInit() {
  }

}
