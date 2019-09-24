import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityRepititionDisplay } from './activity-repitition-display.class';
import { faPlusCircle, faMinusCircle, faPlus, faSyncAlt, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { TimeUnit } from '../../../../../shared/utilities/time-unit.enum';
import { ActivityOccurrenceConfiguration } from '../../../api/activity-occurrence-configuration.interface';
import { ActivityScheduleRepitition } from '../../../api/activity-schedule-repitition.interface';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';

@Component({
  selector: 'app-activity-repitition-display',
  templateUrl: './activity-repitition-display.component.html',
  styleUrls: ['./activity-repitition-display.component.css']
})
export class ActivityRepititionDisplayComponent implements OnInit {

  constructor() { }

  private _repitition: ActivityRepititionDisplay;
  @Input() public set repitition(repitition: ActivityRepititionDisplay){
    this._repitition = repitition;

  }
  @Input("new") public set creatingNew(creatingNew: boolean){
    this._creatingNew = creatingNew;
  }
  public get repitition(): ActivityRepititionDisplay{
    return this._repitition;
  }

  private _creatingNew: boolean = false;
  public get creatingNew(): boolean{
    return this._creatingNew;
  }


  
  ngOnInit() {

  }

  @Output() repititionSaved: EventEmitter<ActivityScheduleRepitition> = new EventEmitter();

  public onClickSaveRepitition(){
    this.repitition.onMouseLeave();
    this.repititionSaved.emit(this.repitition.exportRepititionItem);
  }
  public onClickCancel(){
    this.repitition.onCancelEditing();
    this.repititionSaved.emit(null);
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
    }
    this._dropdownListExpanded = false;
  }

  public timeUnit(frame: string): TimeUnit {
    if (frame == "day" || frame == "days") { return TimeUnit.Day; }
    if (frame == "week" || frame == "weeks") { return TimeUnit.Week; }
    if (frame == "month" || frame == "months") { return TimeUnit.Month; }
    if (frame == "year" || frame == "years") { return TimeUnit.Year; }
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

  // public get occurrencesString(): string {
  //   if(this.repitition.occurrences.length == 1){
  //     return "occurrence";
  //   }else if(this.repitition.occurrences.length > 1){
  //     return "occurrences";
  //   }
  //   return "";
  // }

  @Output() delete: EventEmitter<any> = new EventEmitter();
  public onClickDelete(){
    this.delete.emit(true);
  }

  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faPlus = faPlus;
  faExclamationCircle = faExclamationCircle;
  faSyncAlt = faSyncAlt;
  faPencilAlt = faPencilAlt;
  faTrashAlt = faTrashAlt;
}
