import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFActivityListItem } from './tlef-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit {

  constructor() { }

  @Input() entryItem: TimelogEntryItem;

  ngOnInit() {
    console.log("Entry item: ", this.entryItem);
  }

  onActivitiesChanged(items: TLEFActivityListItem[]){
    console.log("activites changed: ", items);
  }

}
