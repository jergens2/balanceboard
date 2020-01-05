import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';

@Component({
  selector: 'app-timelog-small',
  templateUrl: './timelog-small.component.html',
  styleUrls: ['./timelog-small.component.css']
})
export class TimelogSmallComponent implements OnInit {

  constructor() { }


  @Input() activeDay: DaybookDayItem;


  ngOnInit() {
  }


}
