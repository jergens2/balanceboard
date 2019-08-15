import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';

@Component({
  selector: 'app-daily-task-list-small',
  templateUrl: './daily-task-list-small.component.html',
  styleUrls: ['./daily-task-list-small.component.css']
})
export class DailyTaskListSmallComponent implements OnInit {

  constructor() { }

  @Input() activeDay: DaybookDayItem;

  ngOnInit() {
  }

}
