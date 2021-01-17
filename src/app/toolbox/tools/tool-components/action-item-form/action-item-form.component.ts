import { Component, OnInit, Input } from '@angular/core';

import { ToolboxService } from '../../../toolbox.service';
import { ToolType } from '../../../tool-type.enum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { faCircle, faCheckCircle, IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { Task } from '../../../../dashboard/tasks/task/task.model';
import { TaskHttpService } from '../../../../dashboard/tasks/task-http.service';
import { ModalService } from '../../../../modal/modal.service';
import * as moment from 'moment';

@Component({
  selector: 'app-action-item-form',
  templateUrl: './action-item-form.component.html',
  styleUrls: ['./action-item-form.component.css']
})
export class ActionItemFormComponent implements OnInit {


  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  constructor(private toolsService: ToolboxService, private taskService: TaskHttpService, private modalService: ModalService) { }


  taskForm: FormGroup;

  @Input() action :string;


  modifyTask: Task;

  ngOnInit() {
    if(this.action == "MODIFY"){

      this.modifyTask = this.modalService.activeModal.modalData;
      this.taskForm = new FormGroup({
        "title": new FormControl(this.modifyTask.title, Validators.required),
        "directoryPath": new FormControl(this.modifyTask.directoryPath),
        "description": new FormControl(this.modifyTask.description),
        "timeRequiredHours": new FormControl(0),
        "timeRequiredMinutes": new FormControl(0),
        "priority": new FormControl(1),
        "dueDate": new FormControl(),
      });
    }else if(this.action == "GROUP_NEW"){
      console.log("its a grou-New")
      this.modifyTask = this.modalService.activeModal.modalData;
      this.taskForm = new FormGroup({
        "title": new FormControl("", Validators.required),
        "directoryPath": new FormControl(this.modifyTask.directoryPath),
        "description": new FormControl(""),
        "timeRequiredHours": new FormControl(0),
        "timeRequiredMinutes": new FormControl(0),
        "priority": new FormControl(1),
        "dueDate": new FormControl(),
      });
    }else{
      this.taskForm = new FormGroup({
        "title": new FormControl("", Validators.required),
        "directoryPath": new FormControl(""),
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
    let directoryPath: string = this.taskForm.controls['directoryPath'].value;
    let priority: number = this.taskForm.controls['priority'].value as number;
    let dueDate: moment.Moment;
    if(this.taskForm.controls['dueDate'].value){
      dueDate = moment(this.taskForm.controls['dueDate'].value);
    }


    if(this.action == "MODIFY"){
      let modifyTask = new Task(this.modifyTask.id, this.modifyTask.userId, title, description, directoryPath, priority, this.modifyTask.createdDate, dueDate);
      this.taskService.updateTaskHTTP(modifyTask);
    }else if(this.action == "GROUP_NEW"){
      let task = new Task('', this.taskService.userId, title, description, directoryPath, priority, this.modifyTask.createdDate, dueDate);
      this.taskService.createTaskHTTP(task);
    }else{
      let task = new Task('', this.taskService.userId, title, description, directoryPath, priority, moment(), dueDate);
      this.taskService.createTaskHTTP(task);
    }

    this.toolsService.closeTool();
    this.modalService.closeModal();
  }
  onClickCloseTask(){
    this.toolsService.closeTool();
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
