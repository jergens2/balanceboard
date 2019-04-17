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
  currentObjective: Objective = null;

  private _date: moment.Moment = null;
  ngOnInit() {
    this.modal = this.modalService.activeModal;
    this._date = moment(this.modal.modalData.date);

    if(this.modal.modalData.action == "SET"){
      this.primaryObjectiveForm = new FormGroup({
        'description': new FormControl(null, Validators.required),
        'startDate': new FormControl({value: this._date.format('YYYY-MM-DD'), disabled: true}, Validators.required),
        'dueDate': new FormControl(this._date.format('YYYY-MM-DD'))
      })
  
    }else if(this.modal.modalData.action == "EDIT"){
      this.currentObjective = this.daybookService.currentDay.primaryObjective;
      this.primaryObjectiveForm = new FormGroup({
        'description': new FormControl(this.currentObjective.description, Validators.required),
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
    this.objectivesService.deleteObjectiveHTTP(this.currentObjective);
    this.daybookService.setPrimaryObjective(null, this._date);
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
    let description: string = this.primaryObjectiveForm.controls['description'].value;
    let startDate = moment(this._date).startOf("day");
    let dueDate = moment(this._date).endOf("day");

    let id: string = '';
    let userId: string = '';
    let primaryObjective: Objective;


    if(this.modal.modalData.action == "EDIT"){
      
      id = this.currentObjective.id;
      userId = this.currentObjective.userId;
      primaryObjective = new Objective(id, userId, description, startDate, dueDate);
      
      this.objectivesService.updateObjectiveHTTP$(primaryObjective).subscribe((updatedObjective: Objective)=>{
        this.daybookService.setPrimaryObjective(updatedObjective, this._date);
        this.modalService.closeModal();
      });
    }else if(this.modal.modalData.action == "SET"){
      primaryObjective = new Objective(id, userId, description, startDate, dueDate);

      this.objectivesService.createObjectiveHTTP$(primaryObjective).subscribe((savedObjective: Objective)=>{
        
        this.daybookService.setPrimaryObjective(savedObjective, this._date);
        this.modalService.closeModal();
      })
    }
    
  }

}
