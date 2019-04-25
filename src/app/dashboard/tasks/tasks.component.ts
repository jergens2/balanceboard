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

  private _allTasks: Task[] = [];

  incompleteTasks: Task[] = [];
  completeTasks: Task[] = [];

  ngOnInit() {
    this.taskService.tasks$.subscribe((tasks: Task[])=>{
      this._allTasks = tasks;
      this._allTasks.forEach((task)=>{
        if(task.isComplete){
          this.completeTasks.push(task);
        }else if(!task.isComplete){
          this.incompleteTasks.push(task);
        }
      });
    })
  }

}
