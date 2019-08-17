import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DayStructureTimeColumnRow } from '../time-column-row.class';
import { DayStructureChartLabelLine } from '../chart-label-line.class';

@Component({
  selector: 'app-move-chart-line-area',
  templateUrl: './move-chart-line-area.component.html',
  styleUrls: ['./move-chart-line-area.component.css']
})
export class MoveChartLineAreaComponent implements OnInit {

  constructor() { }

  @Input() chartConfiguration: any;
  @Input() cursorPosition: DayStructureTimeColumnRow;
  // @Output() cursorPositionChanged: EventEmitter<DayStructureTimeColumnRow> = new EventEmitter();



  ngOnInit() {

  }


  public bodyLabel(chartLabelLine: DayStructureChartLabelLine): string{
    if(chartLabelLine.durationMinutes >= 30){
      return chartLabelLine.bodyLabel;
    }else{
      return "";
    }
  }



  

}
