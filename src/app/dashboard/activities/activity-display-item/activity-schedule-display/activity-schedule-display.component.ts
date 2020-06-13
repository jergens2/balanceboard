import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { ActivityScheduleRepitition } from '../../api/activity-schedule-repitition.interface';
import { TimeOfDayConverter } from '../../../../shared/time-utilities/time-of-day-converter.class';
import { TimeUnitConverter } from '../../../../shared/time-utilities/time-unit-converter.class';
import { faSyncAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-activity-schedule-display',
  templateUrl: './activity-schedule-display.component.html',
  styleUrls: ['./activity-schedule-display.component.css']
})
export class ActivityScheduleDisplayComponent implements OnInit {

  constructor() { }

  private _activity: ActivityCategoryDefinition;
  public get activity(): ActivityCategoryDefinition{    return this._activity; }
  @Input() public set activity(activity: ActivityCategoryDefinition){
    this._activity = activity;
    this.confirmDelete = false;
  }
  @Output() configure: EventEmitter<boolean> = new EventEmitter();
  @Output() delete: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
  }

  public confirmDelete:boolean = false;
  public onClickConfigureSchedule() {
    this.configure.emit(true);
  }
  public onClickEdit(){
    this.configure.emit(true);
  }
  public onClickConfirmDelete(){
    this.delete.emit(true);
    this.confirmDelete = false;
  }

  public get scheduleConfigurationSummary(): string {

    let summary: string = "";
    if (this.activity.scheduleRepititions.length == 1) {
      return "This activity repeats " + this.scheduleRepititionSummary(this.activity.scheduleRepititions[0]);
    } else if (this.activity.scheduleRepititions.length > 1) {
      summary = "This activity repeats ";
      for (let i = 0; i < this.activity.scheduleRepititions.length; i++) {
        if(i == this.activity.scheduleRepititions.length-1){
          summary += this.scheduleRepititionSummary(this.activity.scheduleRepititions[i]);
        }else{
          summary += this.scheduleRepititionSummary(this.activity.scheduleRepititions[i]) + ", and ";
        }
        
      }
    }
    return summary;
  }

  public scheduleRepititionSummary(repitition: ActivityScheduleRepitition): string{
    let summary: string = "every "
    let frequency :string = "";
    let unit = TimeUnitConverter.convertToString(repitition.unit, true);
    if (repitition.frequency == 1) {
      summary += unit;
    } else {
      summary += repitition.frequency + " " + unit + "s";
    }
    let occurrences: string = repitition.occurrences.length + " times per " + unit;
    if(repitition.occurrences.length == 1){
      occurrences = "1 time per " + unit;
    }
    return summary + ", " + occurrences;
  }

  faPencilAlt = faPencilAlt;
  faTrashAlt = faTrashAlt;
  faSyncAlt = faSyncAlt;
}
