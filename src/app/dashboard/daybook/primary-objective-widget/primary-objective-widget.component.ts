import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Objective } from '../objectives/objective.model';

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
import { ObjectivesService } from '../objectives/objectives.service';

@Component({
  selector: 'app-primary-objective-widget',
  templateUrl: './primary-objective-widget.component.html',
  styleUrls: ['./primary-objective-widget.component.css']
})
export class PrimaryObjectiveWidgetComponent implements OnInit, OnDestroy {

  constructor(private modalService: ModalService, private daybookService: DaybookService, private objectivesService: ObjectivesService) { }
  faSpinner = faSpinner;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;
  faEdit = faEdit;

  loading: boolean = true;

  objective: Objective;
  private _currentDay: Day = null;


  private _modalSubscription: Subscription = new Subscription();
  private _getDaySubscription: Subscription = new Subscription();

  ngOnInit() {
    this._getDaySubscription.unsubscribe();
    this._getDaySubscription = this.daybookService.currentDay$.subscribe((day: Day)=>{
      // console.log("PrimaryObjectiveWidget:  Day changed", day)
      this.loading = true;
      this._currentDay = day;
      
      this.objective = this._currentDay.primaryObjective;
      console.log("updating objective here", this.objective)
      this.loading = false;
    })

  }


  public get objectiveComplete(): boolean {
    if (this.objective) {
      return this.objective.isComplete;
    }
    return false;
  }
  public get objectiveFailed(): boolean {
    return false;
  }

  onClickComplete(){
    this.objective.markComplete(moment());

    console.log("updating objective, it should look like this:", this.objective)
    this.objectivesService.updateObjectiveHTTP$(this.objective).subscribe((updatedObjective: Objective)=>{
      this.objective = updatedObjective;
      console.log("it has been updated, it now looks like this: ", this.objective)
      // this.daybookService.setPrimaryObjective(this.objective, this._currentDay.date);
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
