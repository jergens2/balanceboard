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
  taskList: IvyLeeTaskList;
  private viewSubscription: Subscription;
  private taskListSubscription: Subscription;


  constructor(
    private homeService: HomeService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedView = this.homeService.getView();
    this.taskList = new IvyLeeTaskList();
    this.viewSubscription = this.homeService.timeViewSubject
      .subscribe(
        (view) => {
          this.selectedView = view;
        }
      )
    this.taskList = this.taskService.getIvyLeeTasks();
    this.taskListSubscription = this.taskService.taskListSubject
      .subscribe(
        (taskList) => {
          this.taskList = taskList;
        }
      )
  }

  onClickTimeFrameButton(selectedView){
    this.homeService.setView(selectedView);
  }

  onClick(button: string){
    this.router.navigate(['/' + button]);
  }
}
