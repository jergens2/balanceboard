import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Task } from '../../tasks/task.model';

import * as moment from 'moment';
import { ModalService } from '../../../modal/modal.service';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../modal/modal-option.interface';
import { Modal } from '../../../modal/modal.model';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { DaybookService } from '../daybook.service';
import { Day } from '../day.model';
import { faCircle, faCheckCircle, faEdit } from '@fortawesome/free-regular-svg-icons';
import { TaskService } from '../../tasks/task.service';

@Component({
  selector: 'app-primary-objective-widget',
  templateUrl: './primary-objective-widget.component.html',
  styleUrls: ['./primary-objective-widget.component.css']
})
export class PrimaryTaskWidgetComponent implements OnInit, OnDestroy {

  constructor(private modalService: ModalService, private daybookService: DaybookService, private tasksService: TaskService) { }
  faSpinner = faSpinner;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;
  faEdit = faEdit;

  loading: boolean = true;

  task: Task;
  private _currentDay: Day = null;


  private _modalSubscription: Subscription = new Subscription();
  private _getDaySubscription: Subscription = new Subscription();

  ngOnInit() {
    this._getDaySubscription.unsubscribe();
    this._getDaySubscription = this.daybookService.currentDay$.subscribe((day: Day)=>{

      // console.log("PrimaryTaskWidget:  Day changed", day)
      this.loading = true;
      this._currentDay = day;
      
      this.task = this._currentDay.primaryTask;
      // console.log("updating task here", this.task)
      this.loading = false;
    })

  }


  showEditButton: boolean = false;
  onMouseEnter(){
    this.showEditButton = true;
  }
  onMouseLeave(){
    this.showEditButton = false;
  }

  public get taskComplete(): boolean {
    if (this.task) {
      return this.task.isComplete;
    }
    return false;
  }
  public get taskFailed(): boolean {
    return false;
  }

  onClickComplete(){
    this.task.markComplete(moment());

    console.log("updating task, it should look like this:", this.task)
    this.tasksService.updateTaskHTTP$(this.task).subscribe((updatedTask: Task)=>{
      this.task = updatedTask;
      console.log("it has been updated, it now looks like this: ", this.task)
      // this.daybookService.setPrimaryTask(this.task, this._currentDay.date);
    });

  }
  onClickUnsetComplete(){

  }

  onClickModifyObjective() {

  }

  onClickEdit(){
    this._modalSubscription.unsubscribe();
    let modalData: any = {
      date: moment(this._currentDay.date),
      action: "EDIT"
    }
    let modal: Modal = new Modal(null, modalData, null, {}, ModalComponentType.PrimarObjective);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {

      console.log("modal response:", selectedOption);
    });
    this.modalService.activeModal = modal;
  }

  onClickSetObjective() {

    this._modalSubscription.unsubscribe();
    let modalData: any = {
      date: moment(this._currentDay.date),
      action: "SET"
    }
    let modal: Modal = new Modal(null, modalData, null, {}, ModalComponentType.PrimarObjective);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {

      console.log("modal response:", selectedOption);
    });
    this.modalService.activeModal = modal;
  }

  ngOnDestroy() {
    this._modalSubscription.unsubscribe();
    this._getDaySubscription.unsubscribe();
  }

}
