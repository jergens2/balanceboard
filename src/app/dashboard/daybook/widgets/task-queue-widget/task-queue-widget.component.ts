import { Component, OnInit } from '@angular/core';
import { faCircle, faCheckCircle, faEdit } from '@fortawesome/free-regular-svg-icons';
import { Task } from '../../../tasks/task/task.model';
import { TaskService } from '../../../tasks/task.service';
import { faSpinner, faExpand } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

import * as moment from 'moment';
import { Modal } from '../../../../modal/modal.model';
import { ModalComponentType } from '../../../../modal/modal-component-type.enum';
import { IModalOption } from '../../../../modal/modal-option.interface';
import { ModalService } from '../../../../modal/modal.service';

@Component({
  selector: 'app-task-queue-widget',
  templateUrl: './task-queue-widget.component.html',
  styleUrls: ['./task-queue-widget.component.css']
})
export class TaskQueueWidgetComponent implements OnInit {


  faSpinner = faSpinner;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;
  faExpand = faExpand;
  // faEdit = faEdit;

  constructor(private taskService: TaskService, private modalService: ModalService) { }

  private _modalSubscription: Subscription = new Subscription();

  loading: boolean = true;

  taskQueue: Task[] = [];

  ngOnInit() {

    this.taskQueue = this.taskService.taskQueue;
    this.taskService.taskQueue$.subscribe((taskQueue: Task[])=>{
      this.taskQueue = taskQueue;
      this.loading = false;
    });
    this.loading = false;
  }

  public taskNumber(task: Task): string{
    return (this.taskQueue.indexOf(task) + 1).toString();
  }


  onClickTask(task: Task){
    this._modalSubscription.unsubscribe();
    let modalData: any = {
      // date: moment(this._currentDay.date),
      // action: "EDIT"
    }
    let modal: Modal = new Modal("Task", null, modalData, null, {}, ModalComponentType.Task);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {

      console.log("modal response:", selectedOption);
    });
    this.modalService.activeModal = modal;
  }

  // onClickEdit(task: Task){
    
  // }
  onClickMarkComplete(task: Task){
    
  }
  onClickMarkIncomplete(task: Task){
    
  }


  onClickExpand(){
    console.log("Click Expand");
  }

  mouseOver:boolean = false;
  onMouseEnter(){
    this.mouseOver = true;
  }
  onMouseLeave(){
    this.mouseOver = false;
  }

}
