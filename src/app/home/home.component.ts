import * as moment from 'moment';
import { GenericDataEntry } from '../generic-data/generic-data-entry.model';
import { User } from '../models/user.model';
import { AuthenticationService } from '../authentication/authentication.service';
import { Subscription } from 'rxjs/Subscription';
import { HomeService } from './home.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { IvyLeeTaskList } from '../productivity/ivylee/ivyleeTaskList.model';
import { IvyLeeTask } from '../productivity/ivylee/ivyleeTask.model';
import { GenericDataEntryService } from '../generic-data/generic-data-entry.service';

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



  private viewSubscription: Subscription;
  private taskListSubscription: Subscription;

  // userGenericDataEntries: GenericDataEntry[];
  // userGenericDataEntriesSubjectSubscription: Subscription;

  constructor(
    private homeService: HomeService,
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
  }

  ngOnDestroy(){
  }


  onClickTimeFrameButton(selectedView) {
    this.homeService.setView(selectedView);
  }






}
