import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TimeOfDay } from '../../../../../../shared/utilities/time-of-day-enum';
import { ActivityOccurrenceConfiguration } from '../../../../api/activity-occurrence-configuration.interface';
import { TimeUnit } from '../../../../../../shared/utilities/time-unit.enum';

@Component({
  selector: 'app-new-repitition-occurrence-form',
  templateUrl: './new-repitition-occurrence-form.component.html',
  styleUrls: ['./new-repitition-occurrence-form.component.css']
})
export class NewRepititionOccurrenceFormComponent implements OnInit {

  constructor() { }


  occurrence: ActivityOccurrenceConfiguration;

  @Input() editOccurrence: ActivityOccurrenceConfiguration;

  ngOnInit() {
    if(this.editOccurrence){
      this.occurrence = this.editOccurrence;
    }else{
      this.occurrence = {
      
        index: -1,
        unit: TimeUnit.Day,
  
        minutesPerOccurrence: -1,
        timeOfDayQuarter: TimeOfDay.Any,
        timeOfDayHour: -1,
        timeOfDayMinute: -1,
  
  
        timesOfDay: [],
        timesOfDayRanges: [],
  
        timesOfDayExcludedRanges: [],
  
        daysOfWeek: [],
        daysOfWeekExcluded: [],
  
        daysOfYear: [],
      }
    }
    
  }

  @Output() occurrenceSaved: EventEmitter<ActivityOccurrenceConfiguration> = new EventEmitter();
  public onClickSaveOccurrence() {
    this.occurrenceSaved.emit(this.occurrence);
  }
  public onClickCancel(){
    this.occurrenceSaved.emit(null);
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
    this.occurrence.timeOfDayQuarter = this._timeOfDay;
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
