import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecurringTasksService } from '../../../document-definitions/recurring-task/recurring-tasks.service';
import * as moment from 'moment';
import { RecurringTaskDefinition } from '../../../document-definitions/recurring-task/recurring-task-definition.class';
import { DailyTaskListItem } from './daily-task-list-item.class';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle as faCheckCircleSolid, faTasks } from '@fortawesome/free-solid-svg-icons';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { Router } from '@angular/router';
import { ToolsService } from '../../tools.service';
import { DayDataService } from '../../../document-definitions/day-data/day-data.service';
import { DayData } from '../../../document-definitions/day-data/day-data.class';
import { Subscription } from 'rxjs';


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

  constructor(private toolsService: ToolsService,  private router: Router, private dayDataService: DayDataService) { }

  dtclItems: DailyTaskListItem[];

  noTasks: boolean = false;
  private dayData: DayData;

  private _dataServiceSubscription: Subscription = new Subscription();

  ngOnInit() {
    this.dtclItems = [];
    let today: moment.Moment = moment();

    this.dayDataService.checkForDayData(today);
    this._dataServiceSubscription = this.dayDataService.yearsDayData$.subscribe((dayDatas: DayData[])=>{
      if(dayDatas.length > 0){
        
        this.dayData = dayDatas.find((dayData: DayData)=>{
          return dayData.dateYYYYMMDD == today.format('YYYY-MM-DD');
        });

        if(!this.dayData){
          console.log("Error.  Could not get this days day data.")
        }else{
          this.dayData;
          this.dtclItems = this.dayData.dailyTaskListItems;
          if(this.dtclItems.length == 0){
            this.noTasks = true;
          }
        }

          

      }
      
    });
     

  }
  ngOnDestroy(){
    this._dataServiceSubscription.unsubscribe();
  }

  onClickCheckTask(dtclItem: DailyTaskListItem){
    if(dtclItem.isComplete){
      dtclItem.markIncomplete();
    }else{
      dtclItem.markComplete(moment());
    }
    this.dayData.updateDailyTaskListItems(this.dtclItems);

  }

  private allTasksCompleteManualSwitch: boolean = false;
  public get allTasksComplete(): boolean{
    if(this.allTasksCompleteManualSwitch){
      return false;
    }else{
      if(this.dayData){
        return this.dayData.allDTLItemsComplete;
      }
      return false;
    }
  }

  onClickManageRecurringTasks(){
    this.router.navigate(['/recurring-tasks']);
    this.toolsService.closeTool();
  }

  onClickShowTasksButton(){
    this.allTasksCompleteManualSwitch = !this.allTasksCompleteManualSwitch;
    console.log(this.dtclItems);
  }

}
