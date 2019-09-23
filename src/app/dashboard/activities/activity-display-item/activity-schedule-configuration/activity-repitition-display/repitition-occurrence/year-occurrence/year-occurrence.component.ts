import { Component, OnInit, Input } from '@angular/core';
import { ActivityOccurrenceConfiguration } from '../../../../../api/activity-occurrence-configuration.interface';

@Component({
  selector: 'app-year-occurrence',
  templateUrl: './year-occurrence.component.html',
  styleUrls: ['./year-occurrence.component.css']
})
export class YearOccurrenceComponent implements OnInit {

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
