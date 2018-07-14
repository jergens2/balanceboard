import * as moment from 'moment';
import { GenericDataEntry } from './../models/generic-data-entry.model';
import { User } from './../models/user.model';
import { AuthenticationService } from './../services/authentication.service';
import { Subscription } from 'rxjs/Subscription';
import { HomeService } from './../services/home.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { IvyLeeTaskList } from '../productivity/ivylee/ivyleeTaskList.model';
import { IvyLeeTask } from '../productivity/ivylee/ivyleeTask.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  loadingTaskList: boolean = true;
  
  selectedView: string;
  todaysTaskList: IvyLeeTaskList;
  allTasksComplete: boolean;
  tomorrowsTaskList: IvyLeeTaskList;

  authenticatedUser: User


  private viewSubscription: Subscription;
  private taskListSubscription: Subscription;

  userGenericDataEntries: GenericDataEntry[];


  constructor(
    private homeService: HomeService,
    private taskService: TaskService,
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
    this.authenticatedUser = this.authService.getAuthenticatedUser();

    this.homeService.userGenericDataEntriesSubject
      .subscribe((dataEntries: GenericDataEntry[]) => {
        this.userGenericDataEntries = dataEntries;
        
        // currenty this component uses the taskService but maybe all task functions should be done through homeService?  
        let foundTaskLists: IvyLeeTaskList[] = this.taskService.findIvyLeeTaskLists(this.userGenericDataEntries);
        let today = moment();
        for(let taskList of foundTaskLists){
          //will only find one task list for today.  if there are multiple then that would be a bug.
          if(moment(taskList.forDate).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')){
            this.todaysTaskList = taskList;
          }
          if(moment(taskList.forDate).format('YYYY-MM-DD') === moment().add(1,'days').format('YYYY-MM-DD')){
            this.tomorrowsTaskList = taskList;
          }
        }
        this.loadingTaskList = false;
      })
    this.homeService.getGenericDataObjects(this.authenticatedUser);

  }




  onClickTimeFrameButton(selectedView) {
    this.homeService.setView(selectedView);
  }


  onClickMonth() {
    this.homeService.setView('month');
  }
  onClickCreateTaskList(forDate: string) {
    if(forDate === 'today'){
      this.taskService.setForDate(moment());
    }else if(forDate === 'tomorrow'){
      this.taskService.setForDate(moment().add(1,'days'));
    }
    this.router.navigate(['/ivylee']);
  }

  onClickTask(task: IvyLeeTask, taskList: IvyLeeTaskList){
    task.isComplete = true;
    task.completionTimeISO = moment().toISOString();
    let allTasksComplete: boolean = true;
    for(let task of taskList.tasks){
      if(!task.isComplete){
        allTasksComplete = false;
      }
    }
    this.allTasksComplete = allTasksComplete;

  }

  onClickOpenTomorrowsTaskList(){
    console.log("This method doesn't do anything atm.  ")
  }


}
