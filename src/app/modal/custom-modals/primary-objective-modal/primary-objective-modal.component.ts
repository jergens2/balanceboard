import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../modal.service';
import { Modal } from '../../modal.model';

import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Task } from '../../../dashboard/tasks/task/task.model';
import { TaskService } from '../../../dashboard/tasks/task.service';
import { DaybookService } from '../../../dashboard/daybook/daybook.service';

@Component({
  selector: 'app-primary-objective-modal',
  templateUrl: './primary-objective-modal.component.html',
  styleUrls: ['./primary-objective-modal.component.css']
})
export class PrimaryObjectiveModalComponent implements OnInit {

  constructor(private modalService: ModalService, private tasksService: TaskService, private daybookService: DaybookService) { }

  modal: Modal = null;
  primaryTaskForm: FormGroup = null;
  currentTask: Task = null;

  private _date: moment.Moment = null;
  ngOnInit() {
    this.modal = this.modalService.activeModal;
    this._date = moment(this.modal.modalData.date);

    if(this.modal.modalData.action == "SET"){
      this.primaryTaskForm = new FormGroup({
        'title': new FormControl(null, Validators.required),
        'description': new FormControl(""),
        'startDate': new FormControl({value: this._date.format('YYYY-MM-DD'), disabled: true}, Validators.required),
        'dueDate': new FormControl(this._date.format('YYYY-MM-DD'))
      })
  
    }else if(this.modal.modalData.action == "EDIT"){
      this.currentTask = this.daybookService.currentDay.primaryTask;
      this.primaryTaskForm = new FormGroup({
        'title': new FormControl(this.currentTask.title, Validators.required),
        'description': new FormControl(""),
        'startDate': new FormControl({value: this._date.format('YYYY-MM-DD'), disabled: true}, Validators.required),
        'dueDate': new FormControl(this._date.format('YYYY-MM-DD'))
      })
  
    }



  }


  confirmDelete: boolean = false;
  onClickDelete(){
    this.confirmDelete = true;
  }
  onClickConfirmDelete(){
    this.tasksService.deleteTaskHTTP(this.currentTask);
    this.daybookService.setPrimaryTask(null, this._date);
    this.modalService.closeModal();
  }
  onMouseLeaveConfirmDelete(){
    this.confirmDelete = false;
  }








  onClickCancel(){
    this.modalService.closeModal();
  }

  private _saveDisabled: boolean = false;
  public get saveDisabled(): string{
    if(this._saveDisabled){
      return "disabled";
    }
    return "";
  }

  onClickSave(){
    this._saveDisabled = true;
    let description: string = this.primaryTaskForm.controls['description'].value;
    let title: string = this.primaryTaskForm.controls['title'].value;
    let startDate = moment(this._date).startOf("day");
    let dueDate = moment(this._date).endOf("day");

    let id: string = '';
    let userId: string = '';
    let primaryTask: Task;


    if(this.modal.modalData.action == "EDIT"){
      
      id = this.currentTask.id;
      userId = this.currentTask.userId;
      primaryTask = new Task(id, userId, title, description, startDate, dueDate);
      
      this.tasksService.updateTaskHTTP$(primaryTask).subscribe((updatedTask: Task)=>{
        this.daybookService.setPrimaryTask(updatedTask, this._date);
        this.modalService.closeModal();
      });
    }else if(this.modal.modalData.action == "SET"){
      primaryTask = new Task(id, userId, title, description, startDate, dueDate);

      this.tasksService.createTaskHTTP$(primaryTask).subscribe((savedTask: Task)=>{
        
        this.daybookService.setPrimaryTask(savedTask, this._date);
        this.modalService.closeModal();
      })
    }
    
  }

}
