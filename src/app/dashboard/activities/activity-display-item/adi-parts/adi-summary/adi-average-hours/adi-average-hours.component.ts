import { Component, OnInit, Input } from '@angular/core';
import { ADIWeekDataChartItem } from '../adi-week-data-chart-item.class';

@Component({
  selector: 'app-adi-average-hours',
  templateUrl: './adi-average-hours.component.html',
  styleUrls: ['./adi-average-hours.component.css']
})
export class AdiAverageHoursComponent implements OnInit {


  private _weekDataItems: ADIWeekDataChartItem[] = [];
  @Input() public set weekDataItems(data: ADIWeekDataChartItem[]){
    this._weekDataItems = data;
  }
  public get weekDataItems(): ADIWeekDataChartItem[] { return this._weekDataItems; }



  ngOnInit(): void {
  }

}
