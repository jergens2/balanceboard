
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
  
  public startTime: moment.Moment;
  public endTime: moment.Moment;
  constructor(public activeModal: NgbActiveModal, private timeService: TimeService) {  }

  newEventActivityForm: FormGroup;

  private response = {
    message: '',
    data: {}
  }

  ngOnInit() {
    this.startTime = this.timeService.getDayEventActivityStartTime();
    this.endTime = this.timeService.getDayEventActivityEndTime();
    this.newEventActivityForm = new FormGroup({
      'startTime': new FormGroup({
        'startTimeDate': new FormControl({value: this.startTime.format('YYYY-MM-DD'), disabled: true}),
        'startTimeHour': new FormControl(this.startTime.hour(), [Validators.min(0),Validators.max(23)]),
        'startTimeMinute': new FormControl(this.startTime.minute(), [Validators.min(0),Validators.max(59)]),
        // 'startTimeSecond': new FormControl({value: this.startTime.format('ss')}, [Validators.min(0),Validators.max(59)]),
      }),
      'endTime': new FormGroup({
        'endTimeDate': new FormControl({value: this.endTime.format('YYYY-MM-DD'), disabled: true}),
        'endTimeHour': new FormControl(this.endTime.hour(), [Validators.min(0),Validators.max(23)]),
        'endTimeMinute': new FormControl(this.endTime.minute(), [Validators.min(0),Validators.max(59)]),
      }),
      'description' : new FormControl(null),
      'category' : new FormControl(null)
    });
  }

  onSaveEventActivity(){
    let event: EventActivity = new EventActivity( this.getStartTime(), this.getEndTime(), this.newEventActivityForm.get('description').value, this.newEventActivityForm.get('category').value );
    this.response.message = 'success';
    this.response.data = event; 
    this.activeModal.close(this.response);
  }

  closeModal(){
    this.response.message = 'cancelled';
    this.activeModal.close(this.response);
  }

  getStartTime(): moment.Moment{
    this.startTime.hour(this.newEventActivityForm.get('startTime.startTimeHour').value).minute(this.newEventActivityForm.get('startTime.startTimeMinute').value);
    return this.startTime;
  }
  getEndTime(): moment.Moment{
    this.endTime.hour(this.newEventActivityForm.get('endTime.endTimeHour').value).minute(this.newEventActivityForm.get('endTime.endTimeMinute').value);
    return this.endTime;
  }

}
