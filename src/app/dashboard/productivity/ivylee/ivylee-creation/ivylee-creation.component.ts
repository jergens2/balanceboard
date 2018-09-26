import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';

import { TaskService } from '../../../services/task.service';
import { IvyLeeTaskList } from '../ivyleeTaskList.model';
import { IvyLeeTask } from '../ivyleeTask.model';



@Component({
  selector: 'app-ivylee',
  templateUrl: './ivylee-creation.component.html',
  styleUrls: ['./ivylee-creation.component.css']
})
export class IvyleeCreationComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  workingTaskList: IvyLeeTaskList;
  buildTaskForm: FormGroup;

  forDate: moment.Moment;

  saveListButtonText: string = "Save Task List";
  saveSpinnerStyle = {
    display: "none"
  }
  saveButtonDisabled = false;
  calendarFormat = {
    lastDay: '[Yesterday]',
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    lastWeek: '[last] dddd',
    nextWeek: 'dddd',
    sameElse: 'L'
  }

  ngOnInit() {

    this.buildTaskForm = this.createForm();
    this.forDate = this.taskService.buildForDate;
    console.log(this.forDate.calendar(null, this.calendarFormat))
  }

  createForm(): FormGroup {
    return new FormGroup({
      'task1': new FormControl(null),
      'task2': new FormControl(null),
      'task3': new FormControl(null),
      'task4': new FormControl(null),
      'task5': new FormControl(null),
      'task6': new FormControl(null)
    });
  }

  onClickSaveTaskList() {
    this.saveSpinnerStyle = { display: 'inline' }
    this.saveListButtonText = "Saving...";

    this.saveButtonDisabled = true;
    let taskArray: IvyLeeTask[] = [];
    taskArray.push(new IvyLeeTask(1, this.buildTaskForm.get('task1').value));
    taskArray.push(new IvyLeeTask(2, this.buildTaskForm.get('task2').value));
    taskArray.push(new IvyLeeTask(3, this.buildTaskForm.get('task3').value));
    taskArray.push(new IvyLeeTask(4, this.buildTaskForm.get('task4').value));
    taskArray.push(new IvyLeeTask(5, this.buildTaskForm.get('task5').value));
    taskArray.push(new IvyLeeTask(6, this.buildTaskForm.get('task6').value));

    this.workingTaskList = new IvyLeeTaskList(taskArray, this.forDate.toISOString());
    this.taskService.submitIvyLeeTasks(this.workingTaskList);

  }
}
