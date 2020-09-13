import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DailyTaskListDataItem } from '../../../daybook-day-item/data-items/daily-task-list-data-item.interface';
// import { RecurringTasksService } from '../../../../activities/routines/routine-definition/api/routine-definition.service';
// import { RecurringTaskDefinition } from '../../../../../shared/document-definitions/recurring-task-definition/recurring-task-definition.class';


@Component({
  selector: 'app-daily-task-list-small',
  templateUrl: './daily-task-list-small.component.html',
  styleUrls: ['./daily-task-list-small.component.css']
})
export class DailyTaskListSmallComponent implements OnInit {

  constructor() { }



  private _dailyTaskListItems: DailyTaskListDataItem[];
  public get dailyTaskListItems(): DailyTaskListDataItem[]{
    return this._dailyTaskListItems;
  }
  ngOnInit() {

  }

  // public recurringTask(dtlItem: DailyTaskListDataItem): RecurringTaskDefinition{
    // return this.recurringTaskService.getRecurringTaskById(dtlItem.recurringTaskId);
  // }

}