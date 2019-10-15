import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from './timelog-entry-item.class';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { RelativeMousePosition } from '../../../../../../../shared/utilities/relative-mouse-position.class';

@Component({
  selector: 'app-timelog-entry',
  templateUrl: './timelog-entry.component.html',
  styleUrls: ['./timelog-entry.component.css']
})
export class TimelogEntryComponent implements OnInit {

  constructor() { }

  private _entry: TimelogEntryItem;
  @Input() public set entry(item: TimelogEntryItem){
    this._entry = item;
  }
  public get entry(): TimelogEntryItem{ return this._entry;}
  public get mouseIsOver(): boolean { return this._entry.itemState.mouseIsOver; }
  public get elementHeight(): number { return this._relativeMousePosition.elementHeight; }
  public get showNewTimelogEntryButton(): boolean { 
    return this.mouseIsOver && this.entry.sleepState === 'AWAKE' && !this._entry.isConfirmed;
  }

  ngOnInit() {
  }

  private _relativeMousePosition: RelativeMousePosition = new RelativeMousePosition();

  public onMouseEnter(event: MouseEvent) {
    this._relativeMousePosition.onMouseMove(event, "timelog-entry-root");
    this._entry.itemState.onMouseEnter();
    console.log(this._entry.sleepState);
  }



  faPlusCircle = faPlusCircle;

}
