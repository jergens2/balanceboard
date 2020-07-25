import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reminder-entry-input',
  templateUrl: './reminder-entry-input.component.html',
  styleUrls: ['./reminder-entry-input.component.css']
})
export class ReminderEntryInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>;
  ngOnInit() {
  }

}
