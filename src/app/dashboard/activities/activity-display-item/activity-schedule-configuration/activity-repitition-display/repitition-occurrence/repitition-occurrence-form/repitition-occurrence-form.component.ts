import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TimeOfDay } from '../../../../../../../shared/utilities/time-of-day-enum';
import { ActivityOccurrenceConfiguration } from '../../../../../api/activity-occurrence-configuration.interface';
import { TimeUnit } from '../../../../../../../shared/utilities/time-unit.enum';
import { ActivityRepititionOccurrence } from '../repitition-occurrence.class';

@Component({
  selector: 'app-repitition-occurrence-form',
  templateUrl: './repitition-occurrence-form.component.html',
  styleUrls: ['./repitition-occurrence-form.component.css']
})
export class RepititionOccurrenceFormComponent implements OnInit {

  constructor() { }


  occurrence: ActivityRepititionOccurrence;

  @Input() editOccurrence: ActivityRepititionOccurrence;
  @Input() newOccurrence: ActivityRepititionOccurrence;

  ngOnInit() {
    if(this.editOccurrence){
      this.occurrence = this.editOccurrence;
    }else if(this.newOccurrence){
      this.occurrence = this.newOccurrence;
    }else{
      console.log("Error");
    }
    
  }

  @Output() occurrenceSaved: EventEmitter<ActivityRepititionOccurrence> = new EventEmitter();
  public onClickSaveOccurrence() {
    this.occurrenceSaved.emit(this.occurrence);
  }
  public onClickCancel(){
    this.occurrence.onClickCancel();
  }

  public timeOfDayList: string[] = ["any", "early morning", "morning", "afternoon", "evening", "specify"];

  private _timeOfDay: TimeOfDay = TimeOfDay.Any;
  public get timeOfDayString(): string {
    if (this._timeOfDay == TimeOfDay.Any) { return "any"; }
    else if (this._timeOfDay == TimeOfDay.EarlyMorning) { return "early morning"; }
    else if (this._timeOfDay == TimeOfDay.Morning) { return "morning"; }
    else if (this._timeOfDay == TimeOfDay.Afternoon) { return "afternoon"; }
    else if (this._timeOfDay == TimeOfDay.Evening) { return "evening"; }
    else if (this._timeOfDay == TimeOfDay.SpecifiedRange) { return "specify"; }
    return "";
  }

  public onListItemSelected(timeOfDay: string) {
    this._timeOfDay = this.timeOfDay(timeOfDay);
    this.occurrence.config.timeOfDayQuarter = this._timeOfDay;
  }

  private timeOfDay(stringVal: string): TimeOfDay {
    if (stringVal == "any") { return TimeOfDay.Any; }
    else if (stringVal == "early morning") { return TimeOfDay.EarlyMorning; }
    else if (stringVal == "morning") { return TimeOfDay.Morning; }
    else if (stringVal == "afternoon") { return TimeOfDay.Afternoon; }
    else if (stringVal == "evening") { return TimeOfDay.Evening; }
    else if (stringVal == "specify") { return TimeOfDay.SpecifiedRange; }
  }

  public get timeHours(): string{
    if (this._timeOfDay == TimeOfDay.EarlyMorning) { return "12:00am to 6:00am"; }
    else if (this._timeOfDay == TimeOfDay.Morning) { return "6:00am to 12:00pm"; }
    else if (this._timeOfDay == TimeOfDay.Afternoon) { return "12:00pm to 6:00pm"; }
    else if (this._timeOfDay == TimeOfDay.Evening) { return "6:00pm to 12:00am"; }
    else {
      return "";
    }

  }

}
