import { Component, OnInit, Input } from '@angular/core';
import { TimeViewConfiguration } from '../time-view-configuration.interface';

@Component({
  selector: 'app-multi-year-view',
  templateUrl: './multi-year-view.component.html',
  styleUrls: ['./multi-year-view.component.css']
})
export class MultiYearViewComponent implements OnInit {

  constructor() { }
  @Input() configuration: TimeViewConfiguration;

  ngOnInit() {
  }

}
