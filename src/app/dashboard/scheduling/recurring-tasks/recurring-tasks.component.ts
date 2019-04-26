import { Component, OnInit } from '@angular/core';
import { RecurringTask } from './recurring-task/recurring-task.model';
import { defaultRecurringTasks } from './recurring-task/default-tasks';

@Component({
  selector: 'app-recurring-tasks',
  templateUrl: './recurring-tasks.component.html',
  styleUrls: ['./recurring-tasks.component.css']
})
export class RecurringTasksComponent implements OnInit {

  constructor() { }


  recurringTasks: RecurringTask[] = [];

  ngOnInit() {
    this.recurringTasks = defaultRecurringTasks;
  }

}
