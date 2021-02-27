import { Component, OnInit, Input } from '@angular/core';
import { TimeOfDay } from '../../../../../../../../shared/time-utilities/time-of-day-enum';
import { ActivityRepititionOccurrence } from '../repitition-occurrence.class';

@Component({
  selector: 'app-day-occurrence',
  templateUrl: './day-occurrence.component.html',
  styleUrls: ['./day-occurrence.component.css']
})
export class DayOccurrenceComponent implements OnInit {

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

  public timeOfDayString(){
    if(this.occurrence.config.timeOfDayQuarter == TimeOfDay.EarlyMorning){
      return "In the early morning (12:00am to 6:00am)";
    }else if(this.occurrence.config.timeOfDayQuarter == TimeOfDay.Morning){
      return "In the morning (6:00am to 12:00pm)";
    }else if(this.occurrence.config.timeOfDayQuarter == TimeOfDay.Afternoon){
      return "In the afternoon (12:00pm to 6:00pm)"
    }else if(this.occurrence.config.timeOfDayQuarter == TimeOfDay.Evening){
      return "In the evening (6:00pm to 12:00am)";
    }

    return "";
  }

}
