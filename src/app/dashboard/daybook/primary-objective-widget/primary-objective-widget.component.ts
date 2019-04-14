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

@Component({
  selector: 'app-primary-objective-widget',
  templateUrl: './primary-objective-widget.component.html',
  styleUrls: ['./primary-objective-widget.component.css']
})
export class PrimaryObjectiveWidgetComponent implements OnInit, OnDestroy {

  constructor(private modalService: ModalService, private daybookService: DaybookService) { }
  faSpinner = faSpinner;

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


  onClickModifyObjective() {

  }

  onClickSetObjective() {

    this._modalSubscription.unsubscribe();
    let modalData: any = {
      date: moment(this._currentDay.date)
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
