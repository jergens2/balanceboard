import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Task } from './task.model';
import { faTimes, faArrowCircleUp, faArrowCircleDown } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from '../../../modal/modal.service';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../modal/modal-option.interface';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { Modal } from '../../../modal/modal.class';
import { TaskService } from '../task.service';
import { faCircle, faCheckCircle, faEdit } from '@fortawesome/free-regular-svg-icons';
import * as moment from 'moment';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit, OnDestroy {

  constructor(private modalService: ModalService, private taskService: TaskService) { }

  faEdit = faEdit;
  faTimes = faTimes;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;
  faArrowCircleUp = faArrowCircleUp;
  faArrowCircleDown = faArrowCircleDown;

  private _modalSubscription: Subscription = new Subscription();

  @Input() task: Task;

  ngOnInit() {

  }
  ngOnDestroy() {
    this._modalSubscription.unsubscribe();
  }


  onMouseEnter() {
    this.ifMouseOver = true;
  }
  onMouseLeave() {
    this.ifMouseOver = false;
  }
  ifMouseOver: boolean = false;



  onClickTaskCheck() {
    if (this.task.isComplete) {
      this._modalSubscription.unsubscribe();
      let modalOptions: IModalOption[] = [
        {
          value: "Yes",
          dataObject: null
        },
        {
          value: "No",
          dataObject: null
        }
      ];
      let modal: Modal = new Modal("Task", "Confirm: mark task as incomplete?", null, modalOptions, {}, ModalComponentType.Default);
      this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
        if (selectedOption.value == "Yes") {
          this.task.markIncomplete();
          this.taskService.updateTaskHTTP(this.task);
        } else if (selectedOption.value == "No") {

        } else {
          //error 
        }
      });
      this.modalService.openModal(modal);
    } else if (!this.task.isComplete) {
      this.task.markComplete(moment());
      this.taskService.updateTaskHTTP(this.task);

    }
  }

  onClickPushUp(){

  }

  onClickPushDown(){
    
  }

  onClickEdit(){
    
    this._modalSubscription.unsubscribe();
    let modalData: Task = this.task;
    let modal: Modal = new Modal("Task", null, modalData, null, {}, ModalComponentType.Task);
    modal.action = "MODIFY";
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {

      console.log("modal response:", selectedOption);
    });
    this.modalService.openModal(modal);
  }

  onClickDelete() {
    this._modalSubscription.unsubscribe();
    let modalOptions: IModalOption[] = [
      {
        value: "Yes",
        dataObject: null
      },
      {
        value: "No",
        dataObject: null
      }
    ];
    let modal: Modal = new Modal("Task", "Confirm: Delete Task?", null, modalOptions, {}, ModalComponentType.Default);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      if (selectedOption.value == "Yes") {
        this.taskService.deleteTaskHTTP(this.task);
      } else if (selectedOption.value == "No") {

      } else {
        //error 
      }
    });
    this.modalService.openModal(modal);
  }


  get taskCompletionDate(): string{
    if(this.task.isComplete){
      return "completed " + this.task.completionDate.format('YYYY-MM-DD');
    }else{
      return "";
    }
  }



}
