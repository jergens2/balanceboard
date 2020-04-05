import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tlef-view-only',
  templateUrl: './tlef-view-only.component.html',
  styleUrls: ['./tlef-view-only.component.css']
})
export class TlefViewOnlyComponent implements OnInit {

  private _entryItem: TimelogEntryItem;
  @Input() public set entryItem(item: TimelogEntryItem) { this._entryItem = item; }
  public get entryItem(): TimelogEntryItem { return this._entryItem; }

  // private _isEditing: boolean = false;

  @Output() public editing: EventEmitter<boolean> = new EventEmitter();
  constructor() { }

  // public get isEditing(): boolean { return this._isEditing; }


  ngOnInit() {
  }


  public get activitiesCount(): string {
    if (this.entryItem.timelogEntryActivities.length === 1) {
      return "1 activity";
    } else {
      return this.entryItem.timelogEntryActivities.length + " activities";
    }
  }

  public onClickEdit() {
    this.editing.emit(true);
  }

  faPencil = faPencilAlt;

}
