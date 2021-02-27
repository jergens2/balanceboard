import { Component, OnInit, Input } from '@angular/core';
import { ADIChartDisplayItem } from '../adi-chart-display-item.class';

@Component({
  selector: 'app-adi-average-hours',
  templateUrl: './adi-average-hours.component.html',
  styleUrls: ['./adi-average-hours.component.css']
})
export class AdiAverageHoursComponent implements OnInit {


  private _weekDataItems: ADIChartDisplayItem[] = [];
  @Input() public set weekDataItems(data: ADIChartDisplayItem[]){
    this._weekDataItems = data;
  }
  public get weekDataItems(): ADIChartDisplayItem[] { return this._weekDataItems; }



  ngOnInit(): void {
  }

}
