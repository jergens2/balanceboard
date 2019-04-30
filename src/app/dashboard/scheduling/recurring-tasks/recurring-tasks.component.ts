import { Component, OnInit } from '@angular/core';
import { RecurringTask } from './recurring-task.model';
import * as moment from 'moment';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { RecurringTasksService } from './recurring-tasks.service';

@Component({
  selector: 'app-recurring-tasks',
  templateUrl: './recurring-tasks.component.html',
  styleUrls: ['./recurring-tasks.component.css']
})
export class RecurringTasksComponent implements OnInit {

  constructor(private recurringTasksService: RecurringTasksService) { }


  faCheck = faCheck;

  recurringTasks: RecurringTask[] = [];

  lastSevenDays: any[] = [];


  ngOnInit() {

    this.recurringTasks = this.recurringTasksService.recurringTasks;


    let today: moment.Moment = moment().endOf("day");
    let currentDate: moment.Moment = moment(today).subtract(6, "days");

    while(currentDate.isSameOrBefore(today)){
      this.lastSevenDays.push({
        date: currentDate,
      })
      currentDate = moment(currentDate).add(1,"days");
    }

  }

}
