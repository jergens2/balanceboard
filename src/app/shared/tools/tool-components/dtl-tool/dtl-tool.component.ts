import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { DailyTaskListItem, DailyTaskList } from '../../../document-data/daily-task-list/daily-task-list.class';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle as faCheckCircleSolid, faTasks } from '@fortawesome/free-solid-svg-icons';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { Router } from '@angular/router';
import { ToolsService } from '../../tools.service';
import { DayDataService } from '../../../document-data/day-data/day-data.service';
import { Subscription } from 'rxjs';
import { DailyTaskListService } from '../../../document-data/daily-task-list/daily-task-list.service';


@Component({
  selector: 'app-dtl-tool',
  templateUrl: './dtl-tool.component.html',
  styleUrls: ['./dtl-tool.component.css'],
  animations: [
    trigger('completion', [

      transition(':enter', [
        // style({ opacity: 0 }),
        // animate('0.1s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        // animate('0.5s', style({ opacity: 0 }))
      ])

    ]),
  ]
})
export class DtlToolComponent implements OnInit, OnDestroy {

  faCircle = faCircle;
  faCheckCircle = faCheckCircle;
  faCheckCircleSolid = faCheckCircleSolid;
  faTasks = faTasks;

  constructor(private toolsService: ToolsService,  private router: Router, private dailyTaskListService: DailyTaskListService) { }

  // dtclItems: DailyTaskListItem[];

  noTasks: boolean = false;
  // private dayData: DayData;
  dailyTaskList: DailyTaskList;

  // private _dtlSubscription: Subscription = new Subscription();

  ngOnInit() {
    // this.dtclItems = [];
    
    let today: moment.Moment = moment();

    this.dailyTaskListService.dailyTaskLists$.subscribe((allDTLs: DailyTaskList[])=>{
      this.dailyTaskList = this.dailyTaskListService.todaysDailyTaskList;
    });
    this.dailyTaskList = this.dailyTaskListService.todaysDailyTaskList;
    console.log("This.dailyTaskList is ", this.dailyTaskList);
    
    if(this.dailyTaskList.tasks.length == 0){
      this.noTasks = true;
    }

  }
  ngOnDestroy(){
    // this._dtlSubscription.unsubscribe();
  }

  onClickCheckTask(dtclItem: DailyTaskListItem){
    this.dailyTaskList.onClickCheckTask(dtclItem);
  }

  public get dailyTaskItems(): DailyTaskListItem[]{
    if(this.dailyTaskList){
      return this.dailyTaskList.tasks;
    }else{
      return [];
    }
  }

  public isComplete(task: DailyTaskListItem){
    return this.dailyTaskList.isComplete(task);
  }

  private allTasksCompleteManualSwitch: boolean = false;
  public get allTasksComplete(): boolean{
    if(this.allTasksCompleteManualSwitch){
      return false;
    }
    return this.dailyTaskList.allTasksComplete;
  }

  onClickManageRecurringTasks(){
    this.router.navigate(['/recurring-tasks']);
    this.toolsService.closeTool();
  }

  onClickShowTasksButton(){
    this.allTasksCompleteManualSwitch = !this.allTasksCompleteManualSwitch;
  }

  public showTasksButton: boolean = false;
  onMouseEnterAllComplete(){
    this.showTasksButton = true;
  }
  onMouseLeaveAllComplete(){
    this.showTasksButton = false;
    this.allTasksCompleteManualSwitch = false;
  }

}
