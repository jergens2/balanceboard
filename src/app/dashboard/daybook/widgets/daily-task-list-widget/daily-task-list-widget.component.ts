import { Component, OnInit } from '@angular/core';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { RecurringTasksService } from '../../../../shared/document-definitions/recurring-task/recurring-tasks.service';
import { RecurringTaskDefinition } from '../../../../shared/document-definitions/recurring-task/recurring-task-definition.class';

@Component({
  selector: 'app-daily-task-list-widget',
  templateUrl: './daily-task-list-widget.component.html',
  styleUrls: ['./daily-task-list-widget.component.css']
})
export class DailyTaskListWidgetComponent implements OnInit {


  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  faExpand = faExpand;

  constructor(private recurringTasksService:RecurringTasksService) { }

  recurringTasks: RecurringTaskDefinition[] = [];
  dailyTaskListItems: {taskName: string, isChecked: boolean}[] = [];

  ngOnInit() {

    this.recurringTasks = this.recurringTasksService.recurringTasks;

    this.recurringTasks.forEach((task: RecurringTaskDefinition)=>{
      this.dailyTaskListItems.push({taskName: task.name, isChecked: false})
    })


  }


  onClickDailyTaskListItem(dailyTaskListItem: {taskName: string, isChecked: boolean}){
    dailyTaskListItem.isChecked = !dailyTaskListItem.isChecked;
  }



  onClickExpand(){
    console.log("Click Expand");
  }

  mouseOver:boolean = false;
  onMouseEnter(){
    this.mouseOver = true;
  }
  onMouseLeave(){
    this.mouseOver = false;
  }


}
