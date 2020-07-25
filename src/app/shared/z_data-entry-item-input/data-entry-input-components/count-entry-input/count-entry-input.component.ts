import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-count-entry-input',
  templateUrl: './count-entry-input.component.html',
  styleUrls: ['./count-entry-input.component.css']
})
export class CountEntryInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>;
  ngOnInit() {
  }

}
