import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityOccurrenceConfiguration } from '../../../../api/activity-occurrence-configuration.interface';
import { TimeOfDay } from '../../../../../../shared/utilities/time-of-day-enum';
import { faPlusCircle, faMinusCircle, faTrashAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-repitition-occurrence',
  templateUrl: './repitition-occurrence.component.html',
  styleUrls: ['./repitition-occurrence.component.css']
})
export class RepititionOccurrenceComponent implements OnInit {

  constructor() { }

  @Input() occurrence: ActivityOccurrenceConfiguration;
  @Output() occurrenceSaved: EventEmitter<ActivityOccurrenceConfiguration> = new EventEmitter();
  @Output() delete: EventEmitter<ActivityOccurrenceConfiguration> = new EventEmitter();

  public onOccurrenceSaved(occurrence: ActivityOccurrenceConfiguration){
    this.occurrenceSaved.emit(occurrence);
    this._editing = false;
  }

  ngOnInit() {

  }

  private _editing: boolean = false;
  public get editing(): boolean{
    return this._editing;
  }
  public onClickDelete(){
    this.delete.emit(this.occurrence);
  }
  public onClickEdit(){ 
    this._editing = true;
  }

  // public onClickMinusFrequency(){

  // }
  // public onClickPlusFrequency(){

  // }

  public onMouseEnter(){
    this._mouseIsOver = true;
  }
  public onMouseLeave(){
    this._mouseIsOver = false;
  }
  public get mouseIsOver(): boolean{
    return this._mouseIsOver;
  }
  private _mouseIsOver: boolean = false;

  // faPlusCircle = faPlusCircle;
  // faMinusCircle = faMinusCircle;
  faPencilAlt = faPencilAlt;
  faTrashAlt = faTrashAlt;

}
