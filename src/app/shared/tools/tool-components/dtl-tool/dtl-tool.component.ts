import { Component, OnInit } from '@angular/core';
import { RecurringTasksService } from '../../../document-definitions/recurring-task/recurring-tasks.service';
import * as moment from 'moment';
import { RecurringTaskDefinition } from '../../../../shared/document-definitions/recurring-task/recurring-task-definition.class';


@Component({
  selector: 'app-dtl-tool',
  templateUrl: './dtl-tool.component.html',
  styleUrls: ['./dtl-tool.component.css']
})
export class DtlToolComponent implements OnInit {

  constructor(private recurringTaskService: RecurringTasksService) { }

  

  ngOnInit() {
    let dtlTasks: RecurringTaskDefinition[] = this.recurringTaskService.getTasksForDate(moment());
    // let dtlItems: DailyTaskListItem
    dtlTasks.forEach(dtlTask =>{

    })
  }

}
