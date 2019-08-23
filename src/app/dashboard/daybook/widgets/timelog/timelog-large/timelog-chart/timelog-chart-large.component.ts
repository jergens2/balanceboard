import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../../api/daybook-day-item.class';
import * as moment from 'moment';
import { TimelogWindow } from './timelog-window.interface';
import { TimelogChartLargeRowItem } from './timelog-chart-item/timelog-chart-large-row-item.class';
import { DayStructureDataItem } from '../../../../api/data-items/day-structure-data-item.interface';
import { TimelogDayStructureItem } from './timelog-day-structure-item.interface';
import { TimelogChartLarge } from './timelog-chart-large.class';
import { DaybookService } from '../../../../daybook.service';

@Component({
  selector: 'app-timelog-chart',
  templateUrl: './timelog-chart-large.component.html',
  styleUrls: ['./timelog-chart-large.component.css']
})
export class TimelogChartComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private _activeDay: DaybookDayItem;
  @Input() public set activeDay(activeDay: DaybookDayItem){
    console.log("active day is set to: " + activeDay.dateYYYYMMDD);
    this._activeDay = activeDay;
    if(this._timelogChart){
      console.log("setting the chart")
      this._timelogChart.setActiveDay(activeDay);
    }
  };
  public get activeDay(): DaybookDayItem{
    return this._activeDay;
  }

  windowSize: number = 16;

  private timelogWindow: TimelogWindow;
  private _timelogChart: TimelogChartLarge;
  public get timelogChart(): TimelogChartLarge{
    return this._timelogChart;
  }

  ngOnInit() {
    this.timelogWindow = this.activeDay.getTimelogWindow(this.windowSize);
    this._timelogChart = new TimelogChartLarge(this.timelogWindow, this.activeDay);

    // this.daybookService.activeDay$.subscribe(())

    this._timelogChart.timelogDateChanged$.subscribe((changedDate: moment.Moment)=>{
      this.daybookService.activeDayYYYYMMDD = changedDate.format("YYYY-MM-DD");
    })
  }





  public onWheel(event: WheelEvent){
    if(event.deltaY > 0){
      this._timelogChart.wheelUp();
    }else if(event.deltaY < 0){
      this._timelogChart.wheelDown();
    }
  }



}
