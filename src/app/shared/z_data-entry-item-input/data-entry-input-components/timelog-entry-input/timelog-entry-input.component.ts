import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-timelog-entry-input',
  templateUrl: './timelog-entry-input.component.html',
  styleUrls: ['./timelog-entry-input.component.css']
})
export class TimelogEntryInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>
  ngOnInit() {
  }

}
