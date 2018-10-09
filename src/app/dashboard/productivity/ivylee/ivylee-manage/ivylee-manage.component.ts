import { IvyLeeTask } from '../ivyleeTask.model';
import { IvyLeeTaskList } from '../ivyleeTaskList.model';
import * as moment from 'moment';
import { GenericDataEntry } from '../../../generic-data/generic-data-entry.model';
import { TaskService } from '../task.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ivylee-manage',
  templateUrl: './ivylee-manage.component.html',
  styleUrls: ['./ivylee-manage.component.css']
})
export class IvyleeManageComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  activeTaskList: GenericDataEntry;
  allTaskLists: GenericDataEntry[];

  ngOnInit() {
    this.taskService.ivyLeeTaskLists.subscribe((allTaskLists)=>{
      // console.log("manage:", allTaskLists);
      this.allTaskLists = allTaskLists;
      this.setActiveTaskList(this.taskService.manageForDate);
    })
  }

  setActiveTaskList(manageDate: moment.Moment){
    // console.log("manage date is ", manageDate)
    for(let taskList of this.allTaskLists){
      if(moment((taskList.dataObject as IvyLeeTaskList).forDate).format('YYYY-MM-DD') === manageDate.format('YYYY-MM-DD') ){
        this.activeTaskList = taskList;
      }
    }
  }

  clickTaskComplete(task: IvyLeeTask){
    let checkedTask: IvyLeeTask = Object.assign({}, task);
    checkedTask.isComplete = !task.isComplete;

    let newTaskList: IvyLeeTaskList = Object.assign({}, this.activeTaskList.dataObject as IvyLeeTaskList);
    newTaskList.tasks[newTaskList.tasks.indexOf(task)] = checkedTask;
    newTaskList.isComplete = true;
    for(let task of newTaskList.tasks){
      if(!task.isComplete){
        newTaskList.isComplete = false;
      }
    }

    let newDataEntry: GenericDataEntry = Object.assign({}, this.activeTaskList);
    newDataEntry.dataObject = newTaskList;
    this.taskService.updateTaskList(newDataEntry)
  }

}
