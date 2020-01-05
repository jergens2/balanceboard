import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DailyTaskListDataItem } from '../../../api/data-items/daily-task-list-data-item.interface';
// import { RecurringTasksService } from '../../../../activities/routines/routine-definition/api/routine-definition.service';
// import { RecurringTaskDefinition } from '../../../../../shared/document-definitions/recurring-task-definition/recurring-task-definition.class';
import { DaybookService } from '../../../daybook.service';
import { DaybookController } from '../../../controller/daybook-controller.class';

@Component({
  selector: 'app-daily-task-list-small',
  templateUrl: './daily-task-list-small.component.html',
  styleUrls: ['./daily-task-list-small.component.css']
})
export class DailyTaskListSmallComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }



  activeDayController: DaybookController;

  private _dailyTaskListItems: DailyTaskListDataItem[];
  public get dailyTaskListItems(): DailyTaskListDataItem[]{
    return this._dailyTaskListItems;
  }
  ngOnInit() {
    this.activeDayController = this.daybookService.activeDayController;
    this.daybookService.activeDayController$.subscribe((dayChanged)=>{
      this.activeDayController = dayChanged;
    });
  }

  // public recurringTask(dtlItem: DailyTaskListDataItem): RecurringTaskDefinition{
    // return this.recurringTaskService.getRecurringTaskById(dtlItem.recurringTaskId);
  // }

}