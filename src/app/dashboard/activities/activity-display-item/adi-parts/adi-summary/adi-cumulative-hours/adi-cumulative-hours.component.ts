import { Component, OnInit, Input } from '@angular/core';
import { ADIWeekDataChartItem } from '../adi-week-data-chart-item.class';

@Component({
  selector: 'app-adi-cumulative-hours',
  templateUrl: './adi-cumulative-hours.component.html',
  styleUrls: ['./adi-cumulative-hours.component.css']
})
export class AdiCumulativeHoursComponent implements OnInit {

  constructor() { }

  private _weekDataItems: ADIWeekDataChartItem[] = [];
  @Input() public set weekDataItems(data: ADIWeekDataChartItem[]){
    this._weekDataItems = data;
  }
  public get weekDataItems(): ADIWeekDataChartItem[] { return this._weekDataItems; }


  ngOnInit(): void {

  }

}
