import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-tlef-new-current',
  templateUrl: './tlef-new-current.component.html',
  styleUrls: ['./tlef-new-current.component.css']
})
export class TlefNewCurrentComponent implements OnInit {

  @Input() entryItem: TimelogEntryItem;
  
  constructor() { }

  ngOnInit() {
  }

}
