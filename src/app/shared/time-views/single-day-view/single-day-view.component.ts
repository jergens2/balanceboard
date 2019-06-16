import { Component, OnInit, Input } from '@angular/core';
import { TimeViewConfiguration } from '../time-view-configuration.interface';

@Component({
  selector: 'app-single-day-view',
  templateUrl: './single-day-view.component.html',
  styleUrls: ['./single-day-view.component.css']
})
export class SingleDayViewComponent implements OnInit {

  constructor() { }
  @Input() configuration: TimeViewConfiguration;

  ngOnInit() {
  }

}
