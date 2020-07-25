import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faPlusCircle, faMinusCircle, faTrashAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { ActivityRepititionOccurrence } from './repitition-occurrence.class';

@Component({
  selector: 'app-repitition-occurrence',
  templateUrl: './repitition-occurrence.component.html',
  styleUrls: ['./repitition-occurrence.component.css']
})
export class RepititionOccurrenceComponent implements OnInit {

  constructor() { }

  // private _occurrenceConfig: ActivityOccurrenceConfiguration;
  // @Input("occurrence") public set occurrenceConfig(config: ActivityOccurrenceConfiguration){
  //   this._occurrenceConfig = config;
  //   this._occurrence = new ActivityRepititionOccurrence(this._occurrenceConfig);
  // };

  @Input() public occurrence: ActivityRepititionOccurrence;


  @Output() occurrenceSaved: EventEmitter<ActivityRepititionOccurrence> = new EventEmitter();
  @Output() delete: EventEmitter<ActivityRepititionOccurrence> = new EventEmitter();

  public onOccurrenceSaved(occurrence: ActivityRepititionOccurrence){
    occurrence.isEditing = false;
    this.occurrenceSaved.emit(occurrence);
  }

  // private _occurrence: ActivityRepititionOccurrence;
  // public get occurrence(): ActivityRepititionOccurrence{
  //   return this._occurrence;
  // }

  ngOnInit() {

  }

  

  

  // faPlusCircle = faPlusCircle;
  // faMinusCircle = faMinusCircle;
  faPencilAlt = faPencilAlt;
  faTrashAlt = faTrashAlt;

}
