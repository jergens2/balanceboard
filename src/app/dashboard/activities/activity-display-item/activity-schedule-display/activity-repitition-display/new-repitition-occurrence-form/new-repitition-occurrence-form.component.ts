import { Component, OnInit } from '@angular/core';
import { TimeOfDay } from '../../../../../../shared/utilities/time-of-day-enum';

@Component({
  selector: 'app-new-repitition-occurrence-form',
  templateUrl: './new-repitition-occurrence-form.component.html',
  styleUrls: ['./new-repitition-occurrence-form.component.css']
})
export class NewRepititionOccurrenceFormComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public timeOfDayList: string[] = [ "any", "early morning", "morning", "afternoon", "evening", "specify" ];

  private _timeOfDay: TimeOfDay = TimeOfDay.Any;
  public get timeOfDayString(): string{
    if(this._timeOfDay == TimeOfDay.Any){ return "any"; }
    else if(this._timeOfDay == TimeOfDay.EarlyMorning){ return "early morning"; }
    else if(this._timeOfDay == TimeOfDay.Morning){ return "morning"; }
    else if(this._timeOfDay == TimeOfDay.Afternoon){ return "afternoon"; }
    else if(this._timeOfDay == TimeOfDay.Evening){ return "evening"; }
    else if(this._timeOfDay == TimeOfDay.SpecifiedRange){ return "specify"; }
    return "";
  }

  public onListItemSelected(timeOfDay: string){
    this._timeOfDay = this.timeOfDay(timeOfDay);
  }

  private timeOfDay(stringVal: string): TimeOfDay{
    if(stringVal == "any"){ return TimeOfDay.Any; }
    else if(stringVal == "early morning"){ return TimeOfDay.EarlyMorning; }
    else if(stringVal == "morning"){ return TimeOfDay.Morning; }
    else if(stringVal == "afternoon"){ return TimeOfDay.Afternoon; }
    else if(stringVal == "evening"){ return TimeOfDay.Evening; }
    else if(stringVal == "specify"){ return TimeOfDay.SpecifiedRange; }
  }

}
