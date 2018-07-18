import * as moment from 'moment';
import { GenericDataEntry } from '../models/generic-data-entry.model';
import { User } from '../models/user.model';
import { AuthenticationService } from '../authentication/authentication.service';
import { Subscription } from 'rxjs/Subscription';
import { HomeService } from '../services/home.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { IvyLeeTaskList } from '../productivity/ivylee/ivyleeTaskList.model';
import { IvyLeeTask } from '../productivity/ivylee/ivyleeTask.model';
import { GenericDataEntryService } from '../services/generic-data-entry.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {


  loadingTaskList: boolean = true;

  selectedView: string;
  todaysTaskList: GenericDataEntry;

  tomorrowsTaskList: GenericDataEntry;

  authenticatedUser: User


  private viewSubscription: Subscription;
  private taskListSubscription: Subscription;

  userGenericDataEntries: GenericDataEntry[];
  userGenericDataEntriesSubjectSubscription: Subscription;

  constructor(
    private homeService: HomeService,
    private taskService: TaskService,
    private genericDataEntryService: GenericDataEntryService,
    private authService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.selectedView = this.homeService.getView();
    this.viewSubscription = this.homeService.timeViewSubject
      .subscribe(
        (view) => {
          this.selectedView = view;
        }
      )
    this.authenticatedUser = this.authService.authenticatedUser;

    this.genericDataEntryService.getDataObjectsByUser(this.authenticatedUser);
    this.userGenericDataEntriesSubjectSubscription = this.genericDataEntryService.userGenericDataEntriesSubject
      .subscribe((dataEntries: GenericDataEntry[]) => {
        console.log("subscription is updated!", dataEntries)
        this.userGenericDataEntries = dataEntries;

        // currenty this component uses the taskService but maybe all task functions should be done through homeService?  
        let foundIvyLeeEntries: GenericDataEntry[] = this.taskService.findIvyLeeTaskLists(this.userGenericDataEntries);

        for (let ivyLeeEntry of foundIvyLeeEntries) {
          let taskList = ivyLeeEntry.dataObject as IvyLeeTaskList;

          //will only find one task list for today.  if there are multiple then that would be a bug.
          if (moment(taskList.forDate).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
            this.todaysTaskList = ivyLeeEntry;
          }
          if (moment(taskList.forDate).format('YYYY-MM-DD') === moment().add(1, 'days').format('YYYY-MM-DD')) {
            this.tomorrowsTaskList = ivyLeeEntry;
          }
        }
        this.loadingTaskList = false;
      })

  }

  ngOnDestroy(){
    this.userGenericDataEntriesSubjectSubscription.unsubscribe();
  }


  onClickTimeFrameButton(selectedView) {
    this.homeService.setView(selectedView);
  }


  onClickMonth() {
    this.homeService.setView('month');
  }
  onClickCreateTaskList(forDate: string) {
    if (forDate === 'today') {
      this.taskService.setForDate(moment());
    } else if (forDate === 'tomorrow') {
      this.taskService.setForDate(moment().add(1, 'days'));
    }
    this.router.navigate(['/ivyleeCreation']);
  }

  onClickTask(task: IvyLeeTask, taskListEntry: GenericDataEntry) {
    let checkedTask: IvyLeeTask = Object.assign({}, task);
    checkedTask.isComplete = true;

    let newTaskList: IvyLeeTaskList = Object.assign({}, taskListEntry.dataObject as IvyLeeTaskList);
    newTaskList.tasks[newTaskList.tasks.indexOf(task)] = checkedTask;
    newTaskList.isComplete = true;
    for(let task of newTaskList.tasks){
      if(!task.isComplete){
        newTaskList.isComplete = false;
      }
    }

    let newDataEntry: GenericDataEntry = Object.assign({}, taskListEntry);
    newDataEntry.dataObject = newTaskList;
    this.taskService.updateTaskList(newDataEntry)
  }

  onClickOpenTomorrowsTaskList() {
    console.log("This method doesn't do anything atm.  ")
  }


}
