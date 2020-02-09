import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-tlef-existing-future',
  templateUrl: './tlef-existing-future.component.html',
  styleUrls: ['./tlef-existing-future.component.css']
})
export class TlefExistingFutureComponent implements OnInit {

  @Input() entryItem: TimelogEntryItem;

  constructor() { }

  ngOnInit() {
  }

}
