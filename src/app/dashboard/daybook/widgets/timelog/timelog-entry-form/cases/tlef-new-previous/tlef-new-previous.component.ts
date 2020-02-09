import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-tlef-new-previous',
  templateUrl: './tlef-new-previous.component.html',
  styleUrls: ['./tlef-new-previous.component.css']
})
export class TlefNewPreviousComponent implements OnInit {

  @Input() entryItem: TimelogEntryItem;

  constructor() { }

  ngOnInit() {
  }

}
