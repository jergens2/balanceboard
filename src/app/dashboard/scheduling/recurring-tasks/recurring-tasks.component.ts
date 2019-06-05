import { Component, OnInit } from '@angular/core';
import { RecurringTaskDefinition } from '../../../shared/document-definitions/recurring-task/recurring-task-definition.class';
import * as moment from 'moment';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { RecurringTasksService } from './recurring-tasks.service';
import { ModalService } from '../../../modal/modal.service';
import {  Modal } from '../../../modal/modal.class';
import { ModalComponentType } from '../../../../app/modal/modal-component-type.enum';

@Component({
  selector: 'app-recurring-tasks',
  templateUrl: './recurring-tasks.component.html',
  styleUrls: ['./recurring-tasks.component.css']
})
export class RecurringTasksComponent implements OnInit {

  constructor(private recurringTasksService: RecurringTasksService, private modalService: ModalService) { }


  faCheck = faCheck;

  recurringTasks: RecurringTaskDefinition[] = [];

  lastSevenDays: any[] = [];


  ngOnInit() {

    this.recurringTasks = this.recurringTasksService.recurringTasks;


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
    this.modalService.activeModal = recurringTaskModal;
  }

}
