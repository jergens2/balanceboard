import { Component, OnInit, Input } from '@angular/core';
import { Task } from '../../task/task.model';
import { TaskService } from '../../task.service';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})
export class ListViewComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  private _allTasks: Task[] = [];

  public incompleteTasks: Task[] = [];
  public completeTasks: Task[] = [];

  ngOnInit() {

    this._allTasks = this.taskService.tasks;
    this.taskService.tasks$.subscribe((tasks)=>{
      console.log("je-changed")
      this._allTasks = tasks;
      this.updateTaskLists();
    })



  }

  updateTaskLists(){
    this.completeTasks = [];
    this.incompleteTasks = [];
    this._allTasks.forEach((task)=>{
      if(task.isComplete){
        this.completeTasks.push(task);
      }else if(!task.isComplete){
        this.incompleteTasks.push(task);
      }
    });

    this.completeTasks.sort((task1, task2)=>{
      if(task1.completionDate.isAfter(task2.completionDate)){
        return -1;
      }
      if(task1.completionDate.isBefore(task2.completionDate)){
        return 1;
      }
      return 0;
    });

    this.incompleteTasks.sort((task1, task2)=>{
      if(task1.createdDate.isAfter(task2.createdDate)){
        return -1;
      }
      if(task1.createdDate.isBefore(task2.createdDate)){
        return 1;
      }
      return 0;
    })
  }

}
