import { Component, OnInit } from '@angular/core';
import { TaskService } from './task.service';
import { Task } from './task/task.model';

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
      this.incompleteTasks = [];
      this.completeTasks = [];
      this._allTasks = tasks;
      this._allTasks.forEach((task)=>{
        if(task.isComplete){
          this.completeTasks.push(task);
        }else if(!task.isComplete){
          this.incompleteTasks.push(task);
        }
      });
      console.log(this._allTasks)
      // this.incompleteTasks.sort((task1, task2)=>{
      //   if(task1.completionDate.isBefore(task2.completionDate)){
      //     return -1;
      //   }
      //   if(task1.completionDate.isAfter(task2.completionDate)){
      //     return 1;
      //   }
      //   return 0;
      // })
    })
  }

}
