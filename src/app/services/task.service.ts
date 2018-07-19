import * as moment from 'moment';
import { GenericDataEntry } from '../models/generic-data-entry.model';
import { GenericDataEntryService } from './generic-data-entry.service';
import { Injectable } from '@angular/core';
import { IvyLeeTaskList } from '../productivity/ivylee/ivyleeTaskList.model';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class TaskService {

  private _allIvyLeeTaskLists: BehaviorSubject<GenericDataEntry[]> = new BehaviorSubject([]);

  constructor(private router: Router, private dataService: GenericDataEntryService) { 
    this.dataService.allUserDataEntries.subscribe((dataEntries: GenericDataEntry[])=>{
      this._allIvyLeeTaskLists.next(this.findIvyLeeTaskLists(dataEntries));
      console.log(this._allIvyLeeTaskLists.getValue());
    });
  }

  get ivyLeeTaskLists(): Observable<GenericDataEntry[]>{
    return this._allIvyLeeTaskLists.asObservable();
  }

  private buildListforDate: moment.Moment = moment().add(1,'days');

  set forDate(date: moment.Moment){
    this.buildListforDate = moment(date);
  }
  get forDate(): moment.Moment{
    return this.buildListforDate;
  }

  findIvyLeeTaskLists(dataEntries: GenericDataEntry[]): GenericDataEntry[] {
    let ivyLeeTaskLists: GenericDataEntry[] = []; 
    for (let dataEntry of dataEntries) {
      if(dataEntry.dataType === 'IvyLeeTaskList'){
        ivyLeeTaskLists.push(dataEntry);
      }
    }
    return ivyLeeTaskLists;
  }

  submitIvyLeeTasks(taskList: IvyLeeTaskList){

    let dataObject: GenericDataEntry = new GenericDataEntry(null,null, moment().toISOString(), "IvyLeeTaskList", taskList );
    this.dataService.saveDataObject(dataObject);
    this.router.navigate(['/']);
  }

  updateTaskList(dataEntry: GenericDataEntry){
    this.dataService.updateDataEntryDataObject(dataEntry);
  }



}
