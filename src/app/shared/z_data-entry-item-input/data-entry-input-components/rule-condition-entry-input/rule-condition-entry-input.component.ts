import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rule-condition-entry-input',
  templateUrl: './rule-condition-entry-input.component.html',
  styleUrls: ['./rule-condition-entry-input.component.css']
})
export class RuleConditionEntryInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>;
  ngOnInit() {
  }

}
