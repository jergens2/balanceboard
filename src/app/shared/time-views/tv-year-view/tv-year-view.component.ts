import { Component, OnInit, Input } from '@angular/core';
import { TimeViewsManager } from '../time-views-manager.class';
import { TimeViewYear } from '../tv-year.class';
import * as moment from 'moment';
import { TimeViewMonth } from '../tv-month.class';

@Component({
  selector: 'app-tv-year-view',
  templateUrl: './tv-year-view.component.html',
  styleUrls: ['./tv-year-view.component.css']
})
export class TvYearViewComponent implements OnInit {

  constructor() { }

  @Input() public manager: TimeViewsManager;
  public get months(): TimeViewMonth[] { return this.manager.timeViewMonths; }

  ngOnInit(): void {
  }

}
