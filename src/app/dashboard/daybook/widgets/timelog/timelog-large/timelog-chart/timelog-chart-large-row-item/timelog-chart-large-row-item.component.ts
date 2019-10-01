import { Component, OnInit, Input } from '@angular/core';
import { TimelogChartLargeRowItem } from './timelog-chart-large-row-item.class';
import { faCaretRight, faTimes } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-timelog-chart-large-row-item',
  templateUrl: './timelog-chart-large-row-item.component.html',
  styleUrls: ['./timelog-chart-large-row-item.component.css']
})
export class TimelogChartItemComponent implements OnInit {

  constructor() { }

  @Input() rowItem: TimelogChartLargeRowItem;

  ngOnInit() {
    console.log("rowItem is delineator?", this.rowItem.mouseIsOver)
    // console.log(this.rowItem);
  }

  faCaretRight = faCaretRight;
  faTimes = faTimes;
}
