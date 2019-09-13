import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-feeling-entry-input',
  templateUrl: './feeling-entry-input.component.html',
  styleUrls: ['./feeling-entry-input.component.css']
})
export class FeelingEntryInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>;
  ngOnInit() {
  }

}
