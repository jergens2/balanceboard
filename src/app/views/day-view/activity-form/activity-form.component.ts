import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) { }

  @Output() formAction = new EventEmitter<string>();

  testObservable: Observable<string>;

  ngOnInit() {
    
  }

  closeModal(){
    this.activeModal.close('cancelled');
  }

  specialButton(){
    this.activeModal.close('success');
  }

}
