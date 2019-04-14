import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../modal.service';
import { Modal } from '../../modal.model';

import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Objective } from '../../../dashboard/daybook/objectives/objective.model';
import { ObjectivesService } from '../../../dashboard/daybook/objectives/objectives.service';
import { DaybookService } from '../../../dashboard/daybook/daybook.service';

@Component({
  selector: 'app-primary-objective-modal',
  templateUrl: './primary-objective-modal.component.html',
  styleUrls: ['./primary-objective-modal.component.css']
})
export class PrimaryObjectiveModalComponent implements OnInit {

  constructor(private modalService: ModalService, private objectivesService: ObjectivesService, private daybookService: DaybookService) { }

  modal: Modal = null;
  primaryObjectiveForm: FormGroup = null;

  private _date: moment.Moment = null;
  ngOnInit() {
    this.modal = this.modalService.activeModal;
    this._date = moment(this.modal.modalData.date);


    this.primaryObjectiveForm = new FormGroup({
      'description': new FormControl(null, Validators.required),
      'startDate': new FormControl({value: this._date.format('YYYY-MM-DD'), disabled: true}, Validators.required),
      'dueDate': new FormControl(this._date.format('YYYY-MM-DD'))
    })



  }

  onClickCancel(){
    this.modalService.closeModal();
  }

  onClickSave(){
    let description: string = this.primaryObjectiveForm.controls['description'].value;
    let startDate = moment(this._date).startOf("day");
    let dueDate = moment(this._date).endOf("day");
    let primaryObjective: Objective = new Objective('','',description, startDate, dueDate);
    this.objectivesService.saveObjectiveHTTP$(primaryObjective).subscribe((savedObjective: Objective)=>{
      
      this.daybookService.setPrimaryObjective(savedObjective, this._date);
      this.modalService.closeModal();
    })
  }

}
