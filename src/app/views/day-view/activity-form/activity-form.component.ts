import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import * as moment from 'moment';


@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {

  @Output() formAction = new EventEmitter<string>();

  constructor(public activeModal: NgbActiveModal) { }

  newActivityForm: FormGroup;
  public startTime: moment.Moment;
  public endTime: moment.Moment;

  ngOnInit() {
    this.newActivityForm = new FormGroup({
      'startTime': new FormGroup({
        'startTimeYear': new FormControl(null),
        'startTimeMonth': new FormControl(null),
        'startTimeDay': new FormControl(null),
        'startTimeHour': new FormControl(null),
        'startTimeMinute': new FormControl(null),
        'startTimeSecond': new FormControl(null),
      }),
      'endTimeYear': new FormControl(null),
      'endTimeMonth': new FormControl(null),
      'endTimeDay': new FormControl(null),
      'endTimeHour': new FormControl(null),
      'endTimeMinute': new FormControl(null),
      'endTimeSecond': new FormControl(null),
      'description' : new FormControl(null),
      'category' : new FormControl(null)
    });
  }

  closeModal(){
    this.activeModal.close('cancelled');
  }

  specialButton(){
    this.activeModal.close('success');
  }

}
