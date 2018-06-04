import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {

  @Output() formAction = new EventEmitter<string>();

  constructor(public activeModal: NgbActiveModal) { }

  newActivityForm: FormGroup;

  ngOnInit() {
    this.newActivityForm = new FormGroup({
      'startTime': new FormControl(null),
      'endTime': new FormControl(null),
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
