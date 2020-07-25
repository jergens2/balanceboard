import { Component, OnInit, Input } from '@angular/core';
import { ActivityRepititionOccurrence } from '../repitition-occurrence.class';

@Component({
  selector: 'app-month-occurrence',
  templateUrl: './month-occurrence.component.html',
  styleUrls: ['./month-occurrence.component.css']
})
export class MonthOccurrenceComponent implements OnInit {

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
