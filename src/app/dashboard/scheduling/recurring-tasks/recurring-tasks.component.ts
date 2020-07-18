import { Component, OnInit } from '@angular/core';
import { RecurringTaskDefinition } from '../../../shared/document-definitions/recurring-task-definition/recurring-task-definition.class';
import * as moment from 'moment';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
// import { RecurringTasksService } from '../../activities/routines/routine-definition/api/routine-definition.service';
import { ModalService } from '../../../modal/modal.service';
import {  Modal } from '../../../modal/modal.class';
import { ModalComponentType } from '../../../../app/modal/modal-component-type.enum';
import { IModalOption } from '../../../modal/modal-option.interface';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-recurring-tasks',
  templateUrl: './recurring-tasks.component.html',
  styleUrls: ['./recurring-tasks.component.css']
})
export class RecurringTasksComponent implements OnInit {

  constructor(private modalService: ModalService) { }


  faCheck = faCheck;
  faTimes = faTimes;
  faEdit = faEdit;

  recurringTasks: RecurringTaskDefinition[] = [];

  lastSevenDays: any[] = [];


  ngOnInit() {

    // this.recurringTasks = this.recurringTasksService.recurringTasks;


    let today: moment.Moment = moment().endOf("day");
    let currentDate: moment.Moment = moment(today).subtract(6, "days");

    while(currentDate.isSameOrBefore(today)){
      this.lastSevenDays.push({
        date: currentDate,
      })
      currentDate = moment(currentDate).add(1,"days");
    }

  }

  onClickNewRecurringTask(){
    let recurringTaskModal: Modal = new Modal("Recurring Task", "", null, [], {}, ModalComponentType.RecurringTask);
    this.modalService.openModal(recurringTaskModal);
  }

  onClickEditTask(task: RecurringTaskDefinition){
    let editTaskModal: Modal = new Modal("Edit Recurring Task Definition", "", task, [], {}, ModalComponentType.RecurringTask);
    this.modalService.openModal(editTaskModal);
  }
  
  onClickDeleteTask(task: RecurringTaskDefinition){

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
    let modal: Modal = new Modal("Delete Recurring Task Definition", "Confirm: Delete Recurring Task Definition?", null, modalOptions, {}, ModalComponentType.Default);
    this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      if (selectedOption.value == "Yes") {
        // this.recurringTasksService.httpDeleteRecurringTask(task);
      } else if (selectedOption.value == "No") {

      } else {
        //error 
      }
    });
    this.modalService.openModal(modal);
  }

}
