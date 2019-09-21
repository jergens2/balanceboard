import { Component, OnInit, Input } from '@angular/core';
import { ActivityScheduleRepititionDisplay } from '../activity-schedule-repitition-display.class';
import { faPlusCircle, faMinusCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TimeUnit } from '../../../../../shared/utilities/time-unit.enum';
import { ActivityOccurrenceConfiguration } from '../../../api/activity-occurrence-configuration.interface';

@Component({
  selector: 'app-activity-repitition-display',
  templateUrl: './activity-repitition-display.component.html',
  styleUrls: ['./activity-repitition-display.component.css']
})
export class ActivityRepititionDisplayComponent implements OnInit {

  constructor() { }
  @Input() repitition: ActivityScheduleRepititionDisplay;

  ngOnInit() {
    this.setOccurrences();
  }

  private setOccurrences(){
    this._occurrences = this.repitition.occurrences.filter((occurrence)=>{ return occurrence.unit == this.repitition.unit; });
    console.log("Occurrences has been set to: ", this._occurrences);
  }

  private _occurrences: ActivityOccurrenceConfiguration[] = [];
  public get occurrences(): ActivityOccurrenceConfiguration[]{
    return this._occurrences;
  } 

  public dayOfWeekListItems(): string[] {
    return this.repitition.dayOfWeekListItems;
  }

  private _dropdownListExpanded: boolean = false;
  public get dropdownListExpanded(): boolean {
    return this._dropdownListExpanded;
  }
  public onClickTimeFrame() {
    this._dropdownListExpanded = true;

  }
  public onListItemSelected(listItem: string) {
    if(listItem != ""){
      this.repitition.unit = this.timeUnit(listItem);
      this.setOccurrences();
    }
    this._dropdownListExpanded = false;
  }

  public timeUnit(frame: string): TimeUnit {
    if (frame == "day" || frame == "days") { return TimeUnit.Day; }
    if (frame == "week" || frame == "weeks") { return TimeUnit.Week; }
    if (frame == "month" || frame == "months") { return TimeUnit.Month; }
    if (frame == "year" || frame == "years") { return TimeUnit.Year; }
  }

  public timeUnitFrameString(unit: TimeUnit): string {
    if (this.repitition.frequency == 1) {
      if (unit == TimeUnit.Day) { return "day"; }
      if (unit == TimeUnit.Week) { return "week"; }
      if (unit == TimeUnit.Month) { return "month"; }
      if (unit == TimeUnit.Year) { return "year"; }
    } else if (this.repitition.frequency > 1) {
      if (unit == TimeUnit.Day) { return "days"; }
      if (unit == TimeUnit.Week) { return "weeks"; }
      if (unit == TimeUnit.Month) { return "months"; }
      if (unit == TimeUnit.Year) { return "years"; }
    }
    return "";
  }

  public onClickPlusFrequency() {
    this.repitition.frequency++;
  }
  public onClickMinusFrequency() {
    let currentValue: number = this.repitition.frequency;
    if (currentValue > 1) {
      currentValue--;
    }
    this.repitition.frequency = currentValue;
  }

  public get occurrencesString(): string {
    if(this.occurrences.length == 1){
      return "occurrence";
    }else if(this.occurrences.length > 1){
      return "occurrences";
    }
    return "";
  }

  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faPlus = faPlus;

}
