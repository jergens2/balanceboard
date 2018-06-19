import { Injectable } from '@angular/core';
import { IvyLeeTaskList } from '../productivity/ivylee/ivyleeTaskList.model';
import { Subject } from 'rxjs';

@Injectable()
export class TaskService {

  constructor() { }

  taskList: IvyLeeTaskList = new IvyLeeTaskList();
  taskListSubject: Subject<IvyLeeTaskList> = new Subject();

  getIvyLeeTasks(): IvyLeeTaskList{
    /* 
      search for the task list which should have been created the previous day.  
      for various reasons it is likely that there might not be one, in which case you would be prompted to create one 

    */

    // taskList = http post get task list
    if(!this.taskList){
      console.log("Task List is empty.")
      this.taskList = new IvyLeeTaskList();
    }else{
      
    }
    return this.taskList;
  }

  submitIvyLeeTasks(taskList: IvyLeeTaskList){
    this.taskList = taskList;
    console.log("TaskService: ", this.taskList)
    this.taskListSubject.next(this.taskList);
    //push the task list to the server.
  }

}
