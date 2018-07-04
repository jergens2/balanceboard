
import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NgbActiveModal, NgbTimepicker, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { TimeService } from './../../../services/time.service';
import { EventActivity } from './../../../models/event-activity.model';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  
  private activeEvent: EventActivity;
  newEventActivityForm: FormGroup;
  mode: string;

  constructor(public activeModal: NgbActiveModal, private timeService: TimeService) {  }

  private response = {
    message: '',
    data: {}
  }

  ngOnInit() {
    this.activeEvent = this.timeService.getActiveEvent().event;
    this.mode = this.timeService.getActiveEvent().mode;
    this.newEventActivityForm = new FormGroup({
      'startTime': new FormGroup({
        'startTimeDate': new FormControl({value: moment(this.activeEvent.startTimeISO).format('YYYY-MM-DD'), disabled: true}),
        'startTimeHour': new FormControl(moment(this.activeEvent.startTimeISO).hour(), [Validators.min(0),Validators.max(23)]),
        'startTimeMinute': new FormControl(moment(this.activeEvent.startTimeISO).minute(), [Validators.min(0),Validators.max(59)]),
        // 'startTimeSecond': new FormControl({value: this.startTime.format('ss')}, [Validators.min(0),Validators.max(59)]),
      }),
      'endTime': new FormGroup({
        'endTimeDate': new FormControl({value: moment(this.activeEvent.endTimeISO).format('YYYY-MM-DD'), disabled: true}),
        'endTimeHour': new FormControl(moment(this.activeEvent.endTimeISO).hour(), [Validators.min(0),Validators.max(23)]),
        'endTimeMinute': new FormControl(moment(this.activeEvent.endTimeISO).minute(), [Validators.min(0),Validators.max(59)]),
      }),
      'description' : new FormControl(null),
      'category' : new FormControl(null)
    });
  }

  onSaveEventActivity(){
    let event: EventActivity = new EventActivity("", this.getStartTimeISOString(), this.getEndTimeISOString(), this.newEventActivityForm.get('description').value, this.newEventActivityForm.get('category').value );
    this.response.message = 'success';
    this.response.data = event; 
    this.activeModal.close(this.response);
  }

  onClickDelete(){
    this.response.message = 'delete';
    this.response.data = this.activeEvent; 
    this.activeModal.close(this.response);
  }

  closeModal(){
    this.response.message = 'cancelled';
    this.activeModal.close(this.response);
  }

  getStartTimeISOString(): string{
    return moment(this.activeEvent.startTimeISO).hour(this.newEventActivityForm.get('startTime.startTimeHour').value).minute(this.newEventActivityForm.get('startTime.startTimeMinute').value).toISOString();    
  }
  getEndTimeISOString(): string{
    return moment(this.activeEvent.endTimeISO).hour(this.newEventActivityForm.get('endTime.endTimeHour').value).minute(this.newEventActivityForm.get('endTime.endTimeMinute').value).toISOString();
  }

}
