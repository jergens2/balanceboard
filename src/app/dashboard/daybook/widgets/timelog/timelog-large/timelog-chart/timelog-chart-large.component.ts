import { Component, OnInit } from '@angular/core';
import { DaybookDayItem } from '../../../../api/daybook-day-item.class';
import * as moment from 'moment';
import { TimelogWindow } from './timelog-window.interface';
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
  public get activeDay(): DaybookDayItem{
    return this._activeDay;
  }
  public set activeDay(activeDay: DaybookDayItem){
    this._activeDay = activeDay;
    if(this._timelogChart){
      this._timelogChart.setActiveDay(activeDay);
    }
    
  }

  windowSize: number = 18;

  private timelogWindow: TimelogWindow;
  private _timelogChart: TimelogChartLarge;
  public get timelogChart(): TimelogChartLarge{
    return this._timelogChart;
  }

  ngOnInit() {
    this.activeDay = this.daybookService.activeDay;
    this.timelogWindow = this.activeDay.getTimelogWindow(this.windowSize); 
    this._timelogChart = new TimelogChartLarge(this.timelogWindow, this.activeDay);
    this.daybookService.activeDay$.subscribe((dayChanged)=>{
      this.activeDay = dayChanged;
    });
    this._timelogChart.timelogDateChanged$.subscribe((changedDate: moment.Moment)=>{
      this.daybookService.activeDayYYYYMMDD = changedDate.format("YYYY-MM-DD");
    });
  }




  public onWheel(event: WheelEvent){
    if(event.deltaY > 0){
      this._timelogChart.wheelUp();
    }else if(event.deltaY < 0){
      this._timelogChart.wheelDown();
    }
  }



}
