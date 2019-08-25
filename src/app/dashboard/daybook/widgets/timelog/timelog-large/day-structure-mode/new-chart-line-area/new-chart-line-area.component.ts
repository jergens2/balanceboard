import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { DayStructureTimeColumnRow } from '../time-column-row.class';

@Component({
  selector: 'app-new-chart-line-area',
  templateUrl: './new-chart-line-area.component.html',
  styleUrls: ['./new-chart-line-area.component.css']
})
export class NewChartLineAreaComponent implements OnInit {

  constructor() { }

  @Input() chartConfiguration: any;
  @Input() cursorPosition: DayStructureTimeColumnRow;
  @Output() cursorPositionChanged: EventEmitter<any> = new EventEmitter();

  hourTicks: any[] = [];
  ngOnInit() {
    let hourTicks: any[] = [];
    for(let i=0; i<25; i++){
      hourTicks.push(i);
    }
    this.hourTicks = hourTicks;
  }

}