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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  selectedView: string;
  todaysTaskList: IvyLeeTaskList;
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
    // this.taskList = this.taskService.getIvyLeeTasks();
    // console.log(this.taskList);
    // // this.taskListSubscription = this.taskService.taskListSubject
    //   .subscribe(
    //     (taskList) => {
    //       this.taskList = taskList;
    //     }
    //   )
    this.authenticatedUser = this.authService.getAuthenticatedUser();

    this.homeService.userGenericDataEntriesSubject
      .subscribe((dataEntries: GenericDataEntry[]) => {
        this.userGenericDataEntries = dataEntries;
        let foundTaskLists: IvyLeeTaskList[] = this.taskService.findIvyLeeTaskLists(this.userGenericDataEntries);
        let today = moment();
        for(let taskList of foundTaskLists){
          console.log(taskList);
          //will only find one task list for today.  if there are multiple then that would be a bug.
          if(moment(taskList.forDate).format('YYYY-MM-DD') === today.format('YYYY-MM-DD')){
            console.log("Found a task list for today:", today.toString(), taskList);
          }
        }

      })
    this.homeService.getGenericDataObjects(this.authenticatedUser);


    // .subscribe((response: GenericDataEntry[])=>{
    //   this.userGenericDataEntries = response;
    //   this.findIvyLeeTaskList(this.userGenericDataEntries);
    // })
  }




  onClickTimeFrameButton(selectedView) {
    this.homeService.setView(selectedView);
  }

  onClick(button: string) {
    this.router.navigate(['/' + button]);
  }

  onClickMonth() {
    this.homeService.setView('month');
  }
  onClickCreateTaskList() {

  }




}
