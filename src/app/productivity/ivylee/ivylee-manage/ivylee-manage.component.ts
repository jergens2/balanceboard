import { IvyLeeTaskList } from './../ivyleeTaskList.model';
import * as moment from 'moment';
import { GenericDataEntry } from './../../../models/generic-data-entry.model';
import { TaskService } from './../../../services/task.service';
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
      console.log("manage:", allTaskLists);
      this.allTaskLists = allTaskLists;
      this.setActiveTaskList(this.taskService.manageForDate);
    })
  }

  setActiveTaskList(manageDate: moment.Moment){
    console.log("manage date is ", manageDate)
    for(let taskList of this.allTaskLists){
      if(moment((taskList.dataObject as IvyLeeTaskList).forDate).format('YYYY-MM-DD') === manageDate.format('YYYY-MM-DD') ){
        this.activeTaskList = taskList;
      }
    }
  }

}
