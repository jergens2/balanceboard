import { Component, OnInit, Input } from '@angular/core';
import { TimeViewConfiguration } from '../time-view-configuration.interface';

@Component({
  selector: 'app-six-week-view',
  templateUrl: './six-week-view.component.html',
  styleUrls: ['./six-week-view.component.css']
})
export class SixWeekViewComponent implements OnInit {

  constructor() { }
  @Input() configuration: TimeViewConfiguration;

  ngOnInit() {
  }

}
