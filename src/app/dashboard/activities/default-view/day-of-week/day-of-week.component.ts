import { Component, OnInit, Input } from '@angular/core';
import { IActivityData } from '../activity-data.interface';
import * as moment from 'moment';
import { ActivitiesService } from '../../activities.service';

@Component({
  selector: 'app-day-of-week',
  templateUrl: './day-of-week.component.html',
  styleUrls: ['./day-of-week.component.css']
})
export class DayOfWeekComponent implements OnInit {

  constructor() { }


  @Input() dayOfWeek: {
    date: string,
    activityData: IActivityData
  }

  barChartItems: any[] = [];
  barChartStyle: any = {};

  ngOnInit() {
    if (this.dayOfWeek) {

      this.buildBarChartItems();

    } else {

    }
  }


  private buildBarChartItems() {

    let barChartItems: { name: string, style: any }[] = [];

    let totalDayTime: number = (60 * 24);
    let totalActivityTime: number = this.dayOfWeek.activityData.totalMinutes;

    let percentages: number[] = [];

    let unaccountedForPercent: number = 100 * ((totalDayTime - totalActivityTime) / totalDayTime);
    let allOthersPercent: number = 0;
    let firstActivityPercent: number = 0;
    let secondActivityPercent: number = 0;
    let thirdActivityPercent: number = 0;


    let activityPercentages: number[] = [];

    let count: number = 5;
    if (this.dayOfWeek.activityData.activities.length < count) {
      count = this.dayOfWeek.activityData.activities.length;
    }
    barChartItems.push({ name: "Unaccouunted For", style: { "background-color": "#f2f2f2" } });
    barChartItems.push({ name: "Unaccouunted For", style: { "background-color": "#f4f8ff" } });
    for (let i = count - 1; i >= 0; i--) {
      activityPercentages.push(100 * (this.dayOfWeek.activityData.activities[i].durationMinutes / totalDayTime));
      barChartItems.push({ name: this.dayOfWeek.activityData.activities[i].activity.name, style: { "background-color": this.dayOfWeek.activityData.activities[i].activity.color } })
    }


    let activitiesTotalPercent: number = 0;
    activityPercentages.forEach((num) => { activitiesTotalPercent += num });
    allOthersPercent = 100 - (unaccountedForPercent + activitiesTotalPercent);
    percentages.push(unaccountedForPercent);
    percentages.push(allOthersPercent);
    activityPercentages.forEach((num) => {
      percentages.push(num);
    });





    let gridTemplateRows: string = "";
    percentages.forEach((num) => {
      gridTemplateRows += "" + num + "% ";
    })

    let style: any = {
      "grid-template-rows": gridTemplateRows
    };

    this.barChartItems = barChartItems;
    this.barChartStyle = style;

  }





  public get weekDay(): string {
    return moment(this.dayOfWeek.date).format('ddd');
  }
  public get date(): string {
    return moment(this.dayOfWeek.date).format('MMM Do');
  }


}
