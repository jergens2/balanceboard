import { Component, OnInit, Input } from '@angular/core';
import { ActivityOccurrenceConfiguration } from '../../../../../api/activity-occurrence-configuration.interface';

@Component({
  selector: 'app-month-occurrence',
  templateUrl: './month-occurrence.component.html',
  styleUrls: ['./month-occurrence.component.css']
})
export class MonthOccurrenceComponent implements OnInit {

  constructor() { }

  private _occurrence: ActivityOccurrenceConfiguration;
  @Input() public set occurrence(occurrence: ActivityOccurrenceConfiguration){
    this._occurrence = occurrence;
  }
  public get occurrence(): ActivityOccurrenceConfiguration{
    return this._occurrence;
  }

  ngOnInit() {
  }

}
