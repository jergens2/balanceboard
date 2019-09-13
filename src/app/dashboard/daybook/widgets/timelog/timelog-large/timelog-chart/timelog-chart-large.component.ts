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
  public get activeDay(): DaybookDayItem {
    return this._activeDay;
  }
  public set activeDay(activeDay: DaybookDayItem) {
    this._activeDay = activeDay;
    if (this._timelogChart) {
      this._timelogChart.setActiveDay(activeDay);
    }

  }

  windowSize: number = 18;

  private timelogWindow: TimelogWindow;
  private _timelogChart: TimelogChartLarge;
  public get timelogChart(): TimelogChartLarge {
    return this._timelogChart;
  }

  ngOnInit() {
    this.activeDay = this.daybookService.activeDay;
    let startTime: moment.Moment = moment(this.activeDay.dateYYYYMMDD).hour(7).minute(30).second(0).millisecond(0);
    let endTime: moment.Moment = moment(this.activeDay.dateYYYYMMDD).hour(22).minute(30).second(0).millisecond(0);
    let window: TimelogWindow = {
      windowStartTime: moment(startTime).subtract(1, "hour"),
      startTime: startTime,
      endTime: endTime,
      windowEndTime: moment(endTime).add(1, "hour"),
      size: endTime.diff(startTime, "hours"),
    }
    this.timelogWindow = window;
    this._timelogChart = new TimelogChartLarge(this.timelogWindow, this.activeDay);
    this.daybookService.activeDay$.subscribe((dayChanged) => {
      this.activeDay = dayChanged;
    });
    this._timelogChart.timelogDateChanged$.subscribe((changedDate: moment.Moment) => {
      this.daybookService.activeDayYYYYMMDD = changedDate.format("YYYY-MM-DD");
    });
  }




  public onWheel(event: WheelEvent) {
    if (event.deltaY > 0) {
      this._timelogChart.wheelUp();
    } else if (event.deltaY < 0) {
      this._timelogChart.wheelDown();
    }
  }



}
