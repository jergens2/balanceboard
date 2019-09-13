import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dietary-entry-input',
  templateUrl: './dietary-entry-input.component.html',
  styleUrls: ['./dietary-entry-input.component.css']
})
export class DietaryEntryInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>;
  ngOnInit() {
  }

}
