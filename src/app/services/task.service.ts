import { Injectable } from '@angular/core';
import { IvyLeeTaskList } from '../productivity/ivylee/ivyleeTaskList.model';

@Injectable()
export class TaskService {

  constructor() { }

  taskList: IvyLeeTaskList;

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

}
