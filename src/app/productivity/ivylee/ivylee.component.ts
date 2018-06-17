import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';

import { TaskService } from '../../services/task.service';
import { IvyLeeTaskList } from './ivyleeTaskList.model';



@Component({
  selector: 'app-ivylee',
  templateUrl: './ivylee.component.html',
  styleUrls: ['./ivylee.component.css']
})
export class IvyleeComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  workingTaskList: IvyLeeTaskList;
  buildTask: boolean = false;
  buildTaskForm: FormGroup;
  tomorrow: string;

  ngOnInit() {
    this.workingTaskList = this.taskService.getIvyLeeTasks();
    this.tomorrow = moment().add(1,'day').format('dddd MMM Do, YYYY');
    this.buildTaskForm = this.createForm();
    console.log(this.workingTaskList)
  }

  createForm(): FormGroup{
    return new FormGroup({
      'item1': new FormControl(null),
      'item2': new FormControl(null),
      'item3': new FormControl(null),
      'item4': new FormControl(null),
      'item5': new FormControl(null),
      'item6': new FormControl(null)
    });
  }

  onClickAddTask(){
    this.buildTask = true;
  }
  onClickSaveTaskList(){

  }
}
