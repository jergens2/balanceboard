import * as moment from 'moment';
import { GenericDataEntry } from '../models/generic-data-entry.model';
import { GenericDataEntryService } from './generic-data-entry.service';
import { Injectable } from '@angular/core';
import { IvyLeeTaskList } from '../productivity/ivylee/ivyleeTaskList.model';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class TaskService {

  constructor(private router: Router, private authService: AuthenticationService, private dataService: GenericDataEntryService) { }

  //2018-07-12: probably don't want to actually instantiate the object.
  // tomorrowsTaskList: IvyLeeTaskList = new IvyLeeTaskList([],moment().toISOString());
  // todaysTaskList: IvyLeeTaskList;
  // historicTaskLists: IvyLeeTaskList[];

  // taskListSubject: Subject<IvyLeeTaskList> = new Subject();

  //by default the build date will be for tomorrow unless set otherwise
  buildListforDate: moment.Moment = moment().add(1,'days');



  findIvyLeeTaskLists(dataEntries: GenericDataEntry[]): GenericDataEntry[] {
    /*
      2018-07-14: 
      I've set this function to be of type GenericDataEntry soas to retain the .id property for easier reference.
      The IvyLeeTaskList will have to be obtained as a property of the GenericDataEntry object
    */
    let ivyLeeTaskLists: GenericDataEntry[] = []; 
    for (let dataEntry of dataEntries) {
      if(dataEntry.dataType === 'IvyLeeTaskList'){
        ivyLeeTaskLists.push(dataEntry);
      }
    }
    return ivyLeeTaskLists;
  }

  submitIvyLeeTasks(taskList: IvyLeeTaskList){

    let dataObject: GenericDataEntry = new GenericDataEntry('',this.authService.authenticatedUser.id, moment().toISOString(), "IvyLeeTaskList", taskList );
    this.dataService.saveDataObject(dataObject)
      // .subscribe((response: { message: string, data: any })=>{
      //   // response.data is the saved IvyLeeTaskList.  Need to set the todaysTaskList as this object.
      // });
    this.router.navigate(['/']);
  }

  updateTaskList(dataEntry: GenericDataEntry){
    this.dataService.updateDataEntryDataObject(dataEntry);
  }

  setForDate(date: moment.Moment){
    this.buildListforDate = moment(date);
  }

}
