import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';

@Component({
  selector: 'app-daily-task-list-large',
  templateUrl: './daily-task-list-large.component.html',
  styleUrls: ['./daily-task-list-large.component.css']
})
export class DailyTaskListLargeComponent implements OnInit {

  constructor() { }

  @Input() activeDay: DaybookDayItem;

  ngOnInit() {
  }

}
