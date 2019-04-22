import { Component, OnInit } from '@angular/core';
import { TaskService } from './task.service';
import { Task } from './task.model';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  constructor(private taskService: TaskService) { }


  tasks: Task[] = [];

  ngOnInit() {
    this.taskService.tasks$.subscribe((tasks: Task[])=>{
      this.tasks = tasks;
    })
  }

}
