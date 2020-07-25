import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-scheduled-event-input',
  templateUrl: './scheduled-event-input.component.html',
  styleUrls: ['./scheduled-event-input.component.css']
})
export class ScheduledEventInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>
  ngOnInit() {
  }

}
