import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

import { DurationString } from '../../../../../../shared/utilities/duration-string.class';

@Component({
  selector: 'app-tlef-chart',
  templateUrl: './tlef-chart.component.html',
  styleUrls: ['./tlef-chart.component.css']
})
export class TlefChartComponent implements OnInit {

  constructor() { }

  @Input() timelogEntryStart: moment.Moment;
  @Input() timelogEntryEnd: moment.Moment;
  

  colorBarGridItems: any[] = [];

  initiated: boolean = false;

  ngOnInit() {
    for(let i=0;i<20;i++){
      this.colorBarGridItems.push({
        value: (5*(i+1))
      })
    }
    this.buildChart();
    this.initiated = true;
  }


  chart: any;
  private buildChart() {

    let timelogEntryMinutes: number = this.timelogEntryEnd.diff(this.timelogEntryStart, "minutes");
    let totalMinutes: number = timelogEntryMinutes * (100 / 80);

    let chartStartTime: moment.Moment = moment(this.timelogEntryStart).subtract((totalMinutes * 0.1), "minutes");
    let chartEndTime: moment.Moment = moment(this.timelogEntryEnd).add((totalMinutes * .1), "minutes");


    // let previousTimelogEntrys: TimelogEntry[] = this.timelogService.timelogEntrys.filter((timelogEntry) => {
    //   let isBefore = timelogEntry.startTime.isBefore(chartStartTime) && timelogEntry.endTime.isAfter(chartStartTime)
    //   let isAfter = timelogEntry.startTime.isAfter(chartStartTime) && timelogEntry.endTime.isSameOrBefore(timelogEntryStart)
    //   if (isBefore || isAfter) {
    //     return timelogEntry;
    //   }
    // });
    // previousTimelogEntrys = previousTimelogEntrys.sort((ts1, ts2) => {
    //   if (ts1.startTime.isBefore(ts2.startTime)) {
    //     return -1;
    //   }
    //   if (ts1.startTime.isAfter(ts2.startTime)) {
    //     return 1;
    //   }
    //   return 0;
    // })



    // let totalMinutes: number = moment(chartEndTime).diff(chartStartTime, "minutes");

    let percentages: number[] = [];
    // previousTimelogEntrys.forEach((timelogEntry) => {
    //   let minutes: number = 0
    //   if (timelogEntry.startTime.isBefore(chartStartTime)) {
    //     minutes = (timelogEntry.endTime.diff(chartStartTime, "minutes"));
    //   } else {
    //     minutes = (timelogEntry.endTime.diff(timelogEntry.startTime, "minutes"));
    //   }

    //   percentages.push((minutes / totalMinutes) * 100);
    // })

    percentages.push((this.timelogEntryEnd.diff(this.timelogEntryStart, "minutes") / totalMinutes) * 100);
    percentages.push((chartEndTime.diff(this.timelogEntryEnd, "minutes") / totalMinutes) * 100);

    let gridTemplateRows: string = "";
    percentages.forEach((percentage) => { gridTemplateRows += " " + percentage.toFixed(2) + "%"; })
    let startGridRow: string = "" + (percentages.length - 1) + " /span 1";
    let endGridRow: string = "" + percentages.length + " / span 1";
    let chartEndRow: string = "" + (percentages.length + 1) + " / span 1";


    let labelLines: {
      style: {

      },
    }[] = [];
    let currentLabelRow: number = 1;
    while (currentLabelRow < percentages.length + 1) {
      let borderTop: string = "";
      if (currentLabelRow != 1 && currentLabelRow < percentages.length + 1) {
        borderTop = "1px solid gray";
      }
      labelLines.push({
        style: {
          "border-top": borderTop,
          "grid-row": "" + currentLabelRow + " / span 1",
        },
      })
      currentLabelRow++;
    }


    let timelogEntryStartStyle = {
      "grid-row": startGridRow,
      "grid-column": "1 / span 1",
    }
    let timelogEntryEndStyle = {
      "grid-row": endGridRow,
      "grid-column": "1 / span 1",
    }
    let chartEndStyle = {
      "grid-row": chartEndRow,
      "grid-column": "1 / span 1",
    }


    let timeBlocks: {
      style: any,
      timelogEntry: any,
      isCurrent: boolean,
      isPrevious: boolean,
      isFuture: boolean,
    }[] = [];
    let currentRow: number = 1;
    // this.previousTimelogEntrys.forEach((previousTimelogEntry) => {
    //   timeBlocks.push({
    //     style: {
    //       "grid-row": "" + currentRow.toFixed(0) + " / span 1",
    //       "grid-column": "3 / span 1",
    //     },
    //     isCurrent: false,
    //     isPrevious: true,
    //     isFuture: false,
    //     timelogEntry: previousTimelogEntry
    //   });
    //   currentRow++;
    // })
    timeBlocks.push({
      style: {
        "grid-row": "" + currentRow.toFixed(0) + " / span 1",
        "grid-column": "3 / span 1",
      },
      isCurrent: true,
      isPrevious: false,
      isFuture: false,
      timelogEntry: null,
    });
    currentRow++;
    timeBlocks.push({
      style: {
        "grid-row": "" + currentRow.toFixed(0) + " / span 1",
        "grid-column": "3 / span 1",
      },
      isCurrent: false,
      isPrevious: false,
      isFuture: true,
      timelogEntry: null,
    });


    let chart: any = {

      gridTemplateRows: gridTemplateRows,
      labelLines: labelLines,

      startTime: chartStartTime,
      endTime: chartEndTime,
      timeBlocks: timeBlocks,
      timelogEntryStart: this.timelogEntryStart,
      timelogEntryEnd: this.timelogEntryEnd,
      timelogEntryMinutes: timelogEntryMinutes,

      timelogEntryStartStyle: timelogEntryStartStyle,
      timelogEntryEndStyle: timelogEntryEndStyle,
      chartEndStyle: chartEndStyle,
      isVisible: true
    };


    if (totalMinutes < 10) {
      chart.isComplete = false;
    }

    this.chart = chart;

    


  }


  public get currentTimelogEntryDuration(): string {
    return DurationString.calculateDurationString(this.timelogEntryStart, this.timelogEntryEnd);
  }



}
