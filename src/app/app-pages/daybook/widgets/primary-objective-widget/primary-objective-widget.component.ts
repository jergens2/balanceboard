import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Task } from '../../../tasks/task/task.model';

import * as moment from 'moment';
import { ModalService } from '../../../../modal/modal.service';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../../modal/modal-option.interface';
import { Modal } from '../../../../modal/modal.class';
import { ModalComponentType } from '../../../../modal/modal-component-type.enum';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { faCircle, faCheckCircle, faEdit } from '@fortawesome/free-regular-svg-icons';
import { TaskHttpService } from '../../../tasks/task-http.service';
import { PrimaryObjectiveService } from './primary-objective.service';

@Component({
  selector: 'app-primary-objective-widget',
  templateUrl: './primary-objective-widget.component.html',
  styleUrls: ['./primary-objective-widget.component.css']
})
export class PrimaryTaskWidgetComponent implements OnInit, OnDestroy {

  constructor(private modalService: ModalService, private tasksService: TaskHttpService, private primaryObjectiveService: PrimaryObjectiveService) { }
  faSpinner = faSpinner;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;
  faEdit = faEdit;

  loading: boolean = true;

  task: Task;



  private _modalSubscription: Subscription = new Subscription();
  private _getDaySubscription: Subscription = new Subscription();

  ngOnInit() {
    // this._getDaySubscription.unsubscribe();
    // this._getDaySubscription = this.daybookControllerService.currentDay$.subscribe((day: DayData)=>{

    //   // console.log("PrimaryTaskWidget:  Day changed", day)
    //   this.loading = true;
    //   this._currentDay = day;
      

    //   // console.log("updating task here", this.task)
    //   this.loading = false;
    // })

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
    this.tasksService.updateTaskHTTP(this.task);

  }
  onClickUnsetComplete(){

  }

  onClickModifyObjective() {

  }

  onClickEdit(){
    // this._modalSubscription.unsubscribe();
    // let modalData: any = {
    //   date: moment(this._currentDay.date),
    //   action: "EDIT"
    // }
    // let modal: Modal = new Modal(null, modalData, null, {}, ModalComponentType.PrimaryObjective);
    // this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {

    //   console.log("modal response:", selectedOption);
    // });
    // this.modalService.activeModal = modal;
  }

  onClickSetObjective() {

    // this._modalSubscription.unsubscribe();
    // let modalData: any = {
    //   date: moment(this._currentDay.date),
    //   action: "SET"
    // }
    // let modal: Modal = new Modal(null, modalData, null, {}, ModalComponentType.PrimaryObjective);
    // this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {

    //   console.log("modal response:", selectedOption);
    // });
    // this.modalService.activeModal = modal;
  }

  ngOnDestroy() {
    this._modalSubscription.unsubscribe();
    this._getDaySubscription.unsubscribe();
  }

}
