import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../timelog-entry-item.class';

@Component({
  selector: 'app-timelog-entry-display',
  templateUrl: './timelog-entry-display.component.html',
  styleUrls: ['./timelog-entry-display.component.css']
})
export class TimelogEntryDisplayComponent implements OnInit {

  constructor() { }

  private _entry: TimelogEntryItem;
  @Input() public set entry(item: TimelogEntryItem){
    this._entry = item;
  }
  public get entry(): TimelogEntryItem{ return this._entry;}


  ngOnInit() {
  }

}
