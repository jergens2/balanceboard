import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-action-item-entry-input',
  templateUrl: './action-item-entry-input.component.html',
  styleUrls: ['./action-item-entry-input.component.css']
})
export class ActionItemEntryInputComponent implements OnInit {

  constructor() { }

  @Input() onClickSave$: Observable<boolean>;

  ngOnInit() {
  }

}
