import { Component, OnInit } from '@angular/core';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { Task } from '../../tasks/task.model';
import { TaskService } from '../../tasks/task.service';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-task-queue-widget',
  templateUrl: './task-queue-widget.component.html',
  styleUrls: ['./task-queue-widget.component.css']
})
export class TaskQueueWidgetComponent implements OnInit {


  faSpinner = faSpinner;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  constructor(private taskService: TaskService) { }

  loading: boolean = true;

  taskQueue: Task[] = [];

  ngOnInit() {

    this.taskQueue = this.taskService.taskQueue;
    this.taskService.taskQueue$.subscribe((taskQueue: Task[])=>{
      this.taskQueue = taskQueue;
      this.loading = false;
    });
    this.loading = false;
  }

  public taskNumber(task: Task): string{
    return (this.taskQueue.indexOf(task) + 1).toString();
  }

}
