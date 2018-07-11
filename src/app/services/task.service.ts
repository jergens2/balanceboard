import * as moment from 'moment';
import { GenericDataEntry } from './../models/generic-data-entry.model';
import { GenericDataEntryService } from './generic-data-entry.service';
import { Injectable } from '@angular/core';
import { IvyLeeTaskList } from '../productivity/ivylee/ivyleeTaskList.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class TaskService {

  constructor(private router: Router, private authService: AuthenticationService, private dataService: GenericDataEntryService) { }

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

    let dataObject: GenericDataEntry = new GenericDataEntry('',this.authService.getAuthenticatedUser().id, moment().toISOString(), taskList );
    this.dataService.saveDataObject(dataObject);

    this.taskList = taskList;
    console.log("TaskService: ", this.taskList)
    this.taskListSubject.next(this.taskList);
    //push the task list to the server.

    this.router.navigate(['/']);
  }

}
