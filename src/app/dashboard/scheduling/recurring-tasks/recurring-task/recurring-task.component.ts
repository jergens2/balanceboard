import { Component, OnInit, Input } from '@angular/core';
import { RecurringTask } from './recurring-task.model';

@Component({
  selector: 'app-recurring-task',
  templateUrl: './recurring-task.component.html',
  styleUrls: ['./recurring-task.component.css']
})
export class RecurringTaskComponent implements OnInit {

  constructor() { }

  @Input() recurringTask: RecurringTask;

  ngOnInit() {
  }

}
