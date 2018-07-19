import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service';

import * as moment from 'moment';
import { Router } from '@angular/router';
import { IvyLeeTask } from '../../../productivity/ivylee/ivyleeTask.model';
import { GenericDataEntry } from '../../../models/generic-data-entry.model';
import { IvyLeeTaskList } from '../../../productivity/ivylee/ivyleeTaskList.model';

@Component({
  selector: 'app-ivylee-widget',
  templateUrl: './ivylee-widget.component.html',
  styleUrls: ['./ivylee-widget.component.css']
})
export class IvyleeWidgetComponent implements OnInit {

  constructor(private taskService: TaskService, private router: Router) { }

  ivyLeeTaskLists: GenericDataEntry[] = [];
  todaysTaskList: GenericDataEntry;
  tomorrowsTaskList: GenericDataEntry;

  ngOnInit() {
    this.taskService.ivyLeeTaskLists.subscribe((ivyLeeTaskLists: GenericDataEntry[])=>{
      this.ivyLeeTaskLists = ivyLeeTaskLists;
      for(let ivyLeeTaskList of ivyLeeTaskLists){
        if(moment((ivyLeeTaskList.dataObject as IvyLeeTaskList).forDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')){
          this.todaysTaskList = ivyLeeTaskList;
        }
        if(moment((ivyLeeTaskList.dataObject as IvyLeeTaskList).forDate).format('YYYY-MM-DD') == moment().add(1,'days').format('YYYY-MM-DD')){
          this.tomorrowsTaskList = ivyLeeTaskList;
        }
      }
    })
  }

  onClickCreateTaskList(forDate: string) {
    if (forDate === 'today') {
      this.taskService.buildForDate = moment();
    } else if (forDate === 'tomorrow') {
      this.taskService.buildForDate = moment().add(1, 'days');
    }
    this.router.navigate(['/ivyleeCreation']);
  }

  onClickTask(task: IvyLeeTask, taskListEntry: GenericDataEntry) {
    let checkedTask: IvyLeeTask = Object.assign({}, task);
    checkedTask.isComplete = !task.isComplete;

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

  onClickOpenTaskManagement(day: string){
    if(day === 'today'){
      this.taskService.manageForDate = moment();
    }else if(day === 'tomorrow'){
      this.taskService.manageForDate = moment().add(1, 'days');
    }
    this.router.navigate(['/ivyleeManagement']);
  }

}
