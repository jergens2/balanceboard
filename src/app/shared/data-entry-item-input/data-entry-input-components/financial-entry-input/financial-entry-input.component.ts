import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-financial-entry-input',
  templateUrl: './financial-entry-input.component.html',
  styleUrls: ['./financial-entry-input.component.css']
})
export class FinancialEntryInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>;
  ngOnInit() {
  }

}
