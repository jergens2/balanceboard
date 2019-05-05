import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../modal.service';
import { Modal } from '../../modal.model';

import * as moment from 'moment';
import { FormGroup } from '@angular/forms';
import { Task } from '../../../dashboard/tasks/task/task.model';
import { TaskService } from '../../../dashboard/tasks/task.service';
import { DaybookService } from '../../../dashboard/daybook/daybook.service';

@Component({
  selector: 'app-primary-objective-modal',
  templateUrl: './primary-objective-modal.component.html',
  styleUrls: ['./primary-objective-modal.component.css']
})
export class PrimaryObjectiveModalComponent implements OnInit {

  constructor(private modalService: ModalService, private tasksService: TaskService, private daybookService: DaybookService) { }

  modal: Modal = null;
  primaryTaskForm: FormGroup = null;
  currentTask: Task = null;

  private _date: moment.Moment = null;
  ngOnInit() {
    this.modal = this.modalService.activeModal;
    this._date = moment(this.modal.modalData.date);

    


  }








}
