import { Component, OnInit } from '@angular/core';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-task-queue-widget',
  templateUrl: './task-queue-widget.component.html',
  styleUrls: ['./task-queue-widget.component.css']
})
export class TaskQueueWidgetComponent implements OnInit {


  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  constructor() { }


  dailyTaskListItems: {taskName: string, isChecked: boolean}[] = [];

  ngOnInit() {
    this.dailyTaskListItems.push({taskName:"Brush teeth",isChecked: false});
    this.dailyTaskListItems.push({taskName:"Make Bed",isChecked: false});
    this.dailyTaskListItems.push({taskName:"Take Vitamins",isChecked: false});

    this.dailyTaskListItems.push({taskName:"20 Pushups",isChecked: false});

  }


  onClickDailyTaskListItem(dailyTaskListItem: {taskName: string, isChecked: boolean}){
    dailyTaskListItem.isChecked = !dailyTaskListItem.isChecked;
  }

}
