import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-tlef-new-future',
  templateUrl: './tlef-new-future.component.html',
  styleUrls: ['./tlef-new-future.component.css']
})
export class TlefNewFutureComponent implements OnInit {


  @Input() entryItem: TimelogEntryItem;

  constructor() { }

  ngOnInit() {
  }

}
