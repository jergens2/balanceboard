import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-health-symptom-entry-input',
  templateUrl: './health-symptom-entry-input.component.html',
  styleUrls: ['./health-symptom-entry-input.component.css']
})
export class HealthSymptomEntryInputComponent implements OnInit {

  constructor() { }
  @Input() onClickSave$: Observable<boolean>;
  ngOnInit() {
  }

}
