import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { DaybookSmallWidget } from '../../daybook-small-widget.interface';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { DailyTaskListDataItem } from '../../../api/data-items/daily-task-list-data-item.interface';
import { RecurringTasksService } from '../../../../../shared/document-definitions/recurring-task-definition/recurring-tasks.service';
import { RecurringTaskDefinition } from '../../../../../shared/document-definitions/recurring-task-definition/recurring-task-definition.class';
import { DaybookService } from '../../../daybook.service';

@Component({
  selector: 'app-daily-task-list-small',
  templateUrl: './daily-task-list-small.component.html',
  styleUrls: ['./daily-task-list-small.component.css']
})
export class DailyTaskListSmallComponent implements OnInit, DaybookSmallWidget {

  constructor(private recurringTaskService: RecurringTasksService, private daybookService: DaybookService) { }



  activeDay: DaybookDayItem;

  private _dailyTaskListItems: DailyTaskListDataItem[];
  public get dailyTaskListItems(): DailyTaskListDataItem[]{
    return this._dailyTaskListItems;
  }
  ngOnInit() {
    this.activeDay = this.daybookService.activeDay;
    this.daybookService.activeDay$.subscribe((dayChanged)=>{
      this.activeDay = dayChanged;
    })
    this._dailyTaskListItems = this.activeDay.dailyTaskListDataItems;
  }

  public recurringTask(dtlItem: DailyTaskListDataItem): RecurringTaskDefinition{
    return this.recurringTaskService.getRecurringTaskById(dtlItem.recurringTaskId);
  }

}