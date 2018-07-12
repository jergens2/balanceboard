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

  //2018-07-12: probably don't want to actually instantiate the object.
  taskList: IvyLeeTaskList = new IvyLeeTaskList([],moment().toISOString());
  taskListSubject: Subject<IvyLeeTaskList> = new Subject();



  findIvyLeeTaskLists(dataEntries: GenericDataEntry[]): IvyLeeTaskList[] {
    /*
      this might be kind of confusing: an IvyLeeTaskList is an object that contains an array of task objects.
      this particular method returns an array of these List objects 
      (the GET request retreives all of these data objects, there will be tasklists from multiple days therefore multiple of them)
    */
    let ivyLeeTaskLists: IvyLeeTaskList[] = []; 
    for (let dataEntry of dataEntries) {
      if(dataEntry.dataType === 'IvyLeeTaskList'){
        let dataObject: IvyLeeTaskList = dataEntry.dataObject as IvyLeeTaskList;
        ivyLeeTaskLists.push(dataObject);
      }
    }
    return ivyLeeTaskLists;
  }

  getIvyLeeTasks(): IvyLeeTaskList{
    /* 
      search for the task list which should have been created the previous day.  
      for various reasons it is likely that there might not be one, in which case you would be prompted to create one 

    */

    // taskList = http post get task list
    if(!this.taskList){
      this.taskList = new IvyLeeTaskList([],moment().toISOString());
    }else{
      
    }
    return this.taskList;
  }

  submitIvyLeeTasks(taskList: IvyLeeTaskList){

    let dataObject: GenericDataEntry = new GenericDataEntry('',this.authService.getAuthenticatedUser().id, moment().toISOString(), "IvyLeeTaskList", taskList );
    this.dataService.saveDataObject(dataObject);

    this.taskList = taskList;
    console.log("TaskService: ", this.taskList)
    this.taskListSubject.next(this.taskList);
    //push the task list to the server.

    this.router.navigate(['/']);
  }

}
