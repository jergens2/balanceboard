import { Component, OnInit, Input } from '@angular/core';
import { ActivityOccurrenceConfiguration } from '../../../../../api/activity-occurrence-configuration.interface';
import { ActivityRepititionOccurrence } from '../repitition-occurrence.class';

@Component({
  selector: 'app-week-occurrence',
  templateUrl: './week-occurrence.component.html',
  styleUrls: ['./week-occurrence.component.css']
})
export class WeekOccurrenceComponent implements OnInit {

  constructor() { }

  private _occurrence: ActivityRepititionOccurrence;
  @Input() public set occurrence(occurrence: ActivityRepititionOccurrence){
    this._occurrence = occurrence;
  }
  public get occurrence(): ActivityRepititionOccurrence{
    return this._occurrence;
  }

  ngOnInit() {
  }

}
