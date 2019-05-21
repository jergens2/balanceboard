import { Component, OnInit, Input } from '@angular/core';

import { ToolsService } from '../../tools.service';
import { ToolComponents } from '../../tool-components.enum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { faCircle, faCheckCircle, IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { Task } from '../../../dashboard/tasks/task/task.model';
import { TaskPriority } from '../../../dashboard/tasks/task/task-priority.enum';
import { TaskService } from '../../../dashboard/tasks/task.service';
import { ModalService } from '../../../modal/modal.service';
import * as moment from 'moment';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {


  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  constructor(private toolsService: ToolsService, private taskService: TaskService, private modalService: ModalService) { }


  taskForm: FormGroup;

  @Input('modifyItem') modifyTask: Task;
  private modeIsModify: boolean = false;


  ngOnInit() {
    if(this.modifyTask){
      this.taskForm = new FormGroup({
        "title": new FormControl(this.modifyTask.title, Validators.required),
        "groupCategory": new FormControl(this.modifyTask.groupCategory),
        "description": new FormControl(this.modifyTask.description),
        "timeRequiredHours": new FormControl(),
        "timeRequiredMinutes": new FormControl(0),
        "priority": new FormControl(1),
        "dueDate": new FormControl(),
      });
    }else{
      this.taskForm = new FormGroup({
        "title": new FormControl("", Validators.required),
        "groupCategory": new FormControl(""),
        "description": new FormControl(""),
        "timeRequiredHours": new FormControl(0),
        "timeRequiredMinutes": new FormControl(0),
        "priority": new FormControl(1),
        "dueDate": new FormControl(),
      });
    }
    
  }



  onClickSaveTask(){
    let title:string = this.taskForm.controls['title'].value;
    let description: string = this.taskForm.controls['description'].value;
    let groupCategory: string = this.taskForm.controls['groupCategory'].value;
    let priority: number = this.taskForm.controls['priority'].value as number;
    let dueDate: moment.Moment;
    if(this.taskForm.controls['dueDate'].value){
      dueDate = moment(this.taskForm.controls['dueDate'].value);
    }
    let taskPriority: TaskPriority;
    if(priority == 0){
      taskPriority = TaskPriority.High;
    }
    if(priority == 1){
      taskPriority = TaskPriority.Normal;
    }
    if(priority == 2){
      taskPriority = TaskPriority.Low;
    }

    if(this.modifyTask){
      let modifyTask = new Task(this.modifyTask.id, this.modifyTask.userId, title, description, groupCategory, priority, this.modifyTask.createdDate, dueDate);
      this.taskService.updateTaskHTTP(modifyTask);
    }else{
      let task = new Task('', '', title, description, groupCategory, priority, moment(), dueDate);
      this.taskService.createTaskHTTP(task);
    }

    this.toolsService.closeTool(ToolComponents.Todo);
    this.modalService.closeModal();
  }
  onClickCloseTask(){
    this.toolsService.closeTool(ToolComponents.Todo);
    this.modalService.closeModal();
  }
  public get saveTaskDisabled(): string{
    if(this.taskForm.valid){
      return "";
    }else{
      return "disabled";
    }
  }

  onClickScheduleAutomatic(){
    this.scheduleAutomatic = true;
  }

  onClickScheduleSpecify(){
    this.scheduleAutomatic = false;
  }

  scheduleAutomatic: boolean = true;
  public get scheduleSpecifyIcon(): IconDefinition {
    if(this.scheduleAutomatic){
      return faCircle;
    }else{
      return faCheckCircle;
    }
  }

  public get scheduleAutomaticIcon(): IconDefinition{
    if(this.scheduleAutomatic){
      return faCheckCircle;
    }else{
      return faCircle;
    }
  }


}
