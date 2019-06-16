import { Component, OnInit, Input } from '@angular/core';
import { TimeViewConfiguration } from '../time-view-configuration.interface';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.css']
})
export class WeekViewComponent implements OnInit {

  constructor() { }
  @Input() configuration: TimeViewConfiguration;

  ngOnInit() {
  }

}
