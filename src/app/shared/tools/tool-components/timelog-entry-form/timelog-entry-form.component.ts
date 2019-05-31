import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogService } from '../../../../dashboard/daybook/time-log/timelog.service';
import { TimeSegment } from '../../../../dashboard/daybook/time-log/time-segment-tile/time-segment.model';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { ModalService } from '../../../../modal/modal.service';
import { ToolsService } from '../../tools.service';
import { UserDefinedActivity } from '../../../../dashboard/activities/user-defined-activity.model';
import { IActivityListItem } from './activity-list-item.interface';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { TimeSegmentActivity } from '../../../../dashboard/daybook/time-log/time-segment-activity.model';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  faTimes = faTimes;

  constructor(private timelogService: TimelogService, private toolsService: ToolsService, private modalService: ModalService) { }

  mostRecentTimelogEntry: TimeSegment;
  currentTimelogEntry: TimeSegment;
  timelogEntryForm: FormGroup = new FormGroup({});

  clockSubscription: Subscription = new Subscription();


  private _now = moment();

  initiated: boolean = false;
  formIsValid: boolean = false;
  activityItems: IActivityListItem[] = [];

  chart: any;

  ngOnInit() {
    this.mostRecentTimelogEntry = this.timelogService.mostRecentTimelogEntry;



    this.clockSubscription = timer(0, 1000).subscribe(() => {
      this._now = moment();
      this.buildChart();

    })

    this.timelogEntryForm = new FormGroup({
      "startTime": new FormControl(),
      "startDate": new FormControl(),
      "endTime": new FormControl(),
      "endDate": new FormControl(),
      "description": new FormControl(),
    });
  }
  ngOnDestroy() {
    this.clockSubscription.unsubscribe();
  }

  private buildChart() {

    let chartStartTime: moment.Moment;
    let chartEndTime: moment.Moment;

    let timeSegmentStart: moment.Moment = moment(this.mostRecentTimelogEntry.endTime);
    let timeSegmentEnd: moment.Moment = moment();
    let timeSegmentMinutes: number = timeSegmentEnd.diff(timeSegmentStart, "minutes");
    let totalMinutes: number = timeSegmentMinutes * (100 / 80);


    chartStartTime = moment(timeSegmentStart).subtract((totalMinutes * 0.1), "minutes");
    chartEndTime = moment(timeSegmentEnd).add((totalMinutes * .1), "minutes");


    let previousTimeSegments: TimeSegment[] = this.timelogService.timeSegments.filter((timeSegment) => {
      let isBefore = timeSegment.startTime.isBefore(chartStartTime) && timeSegment.endTime.isAfter(chartStartTime)
      let isAfter = timeSegment.startTime.isAfter(chartStartTime) && timeSegment.endTime.isSameOrBefore(timeSegmentStart)
      if (isBefore || isAfter) {
        return timeSegment;
      }
    });
    previousTimeSegments = previousTimeSegments.sort((ts1, ts2) => {
      if (ts1.startTime.isBefore(ts2.startTime)) {
        return -1;
      }
      if (ts1.startTime.isAfter(ts2.startTime)) {
        return 1;
      }
      return 0;
    })



    // let totalMinutes: number = moment(chartEndTime).diff(chartStartTime, "minutes");

    let percentages: number[] = [];
    previousTimeSegments.forEach((timeSegment) => {
      let minutes: number = 0
      if (timeSegment.startTime.isBefore(chartStartTime)) {
        minutes = (timeSegment.endTime.diff(chartStartTime, "minutes"));
      } else {
        minutes = (timeSegment.endTime.diff(timeSegment.startTime, "minutes"));
      }

      percentages.push((minutes / totalMinutes) * 100);
    })

    percentages.push((timeSegmentEnd.diff(timeSegmentStart, "minutes") / totalMinutes) * 100);
    percentages.push((chartEndTime.diff(timeSegmentEnd, "minutes") / totalMinutes) * 100);

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


    let timeSegmentStartStyle = {
      "grid-row": startGridRow,
      "grid-column": "1 / span 1",
    }
    let timeSegmentEndStyle = {
      "grid-row": endGridRow,
      "grid-column": "1 / span 1",
    }
    let chartEndStyle = {
      "grid-row": chartEndRow,
      "grid-column": "1 / span 1",
    }


    let timeBlocks: {
      style: any,
      timeSegment: TimeSegment,
      isCurrent: boolean,
      isPrevious: boolean,
      isFuture: boolean,
    }[] = [];
    let currentRow: number = 1;
    previousTimeSegments.forEach((previousTimeSegment) => {
      timeBlocks.push({
        style: {
          "grid-row": "" + currentRow.toFixed(0) + " / span 1",
          "grid-column": "3 / span 1",
        },
        isCurrent: false,
        isPrevious: true,
        isFuture: false,
        timeSegment: previousTimeSegment
      });
      currentRow++;
    })
    timeBlocks.push({
      style: {
        "grid-row": "" + currentRow.toFixed(0) + " / span 1",
        "grid-column": "3 / span 1",
      },
      isCurrent: true,
      isPrevious: false,
      isFuture: false,
      timeSegment: null,
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
      timeSegment: null,
    });


    let chart: any = {

      gridTemplateRows: gridTemplateRows,
      labelLines: labelLines,

      startTime: chartStartTime,
      endTime: chartEndTime,
      timeBlocks: timeBlocks,
      timeSegmentStart: timeSegmentStart,
      timeSegmentEnd: timeSegmentEnd,
      timeSegmentMinutes: timeSegmentMinutes,

      timeSegmentStartStyle: timeSegmentStartStyle,
      timeSegmentEndStyle: timeSegmentEndStyle,
      chartEndStyle: chartEndStyle,
      isVisible: true
    };


    if (totalMinutes < 10) {
      chart.isComplete = false;
    }

    this.chart = chart;

    
    this.timelogEntryForm.controls["startTime"].setValue(timeSegmentStart.second(0).millisecond(0).format('HH:mm'));
    this.timelogEntryForm.controls["startDate"].setValue(timeSegmentStart.format('YYYY-MM-DD'));
    this.timelogEntryForm.controls["endTime"].setValue(timeSegmentEnd.second(0).millisecond(0).format('HH:mm'));
    this.timelogEntryForm.controls["endDate"].setValue(timeSegmentEnd.format('YYYY-MM-DD'));


    this.initiated = true;
  }

  onClickSaveTimelogEntry() {
    let newTimeSegment: TimeSegment = new TimeSegment("", this.timelogService.userId, this.chart.timeSegmentStart.toISOString(), this.chart.timeSegmentEnd.toISOString(), this.timelogEntryForm.controls['description'].value);
    this.activityItems.forEach((activityItem) => {
      newTimeSegment.activities.push(new TimeSegmentActivity(activityItem.activity, ""))
    });
    this.timelogService.saveTimeSegment(newTimeSegment);
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  private updateForm() {
    if (this.activityItems.length > 0) {
      this.formIsValid = true;
    }
  }

  onActivityValueChanged(activity: UserDefinedActivity) {
    let durationMinutes: number = this.chart.timeSegmentMinutes / (this.activityItems.length + 1);

    this.activityItems.push({
      activity: activity,
      durationMinutes: durationMinutes,
      mouseOver: false,
    });
    this.activityItems.forEach((activityItem) => {
      activityItem.durationMinutes = durationMinutes;
    });
    this.updateForm();
  }
  onMouseEnterActivity(activityItem: IActivityListItem) {
    activityItem.mouseOver = true;
  }

  onMouseLeaveActivity(activityItem: IActivityListItem) {
    activityItem.mouseOver = false;
  }
  onClickRemoveActivity(activityItem: IActivityListItem) {
    this.activityItems.splice(this.activityItems.indexOf(activityItem), 1);
    let durationMinutes: number = this.chart.timeSegmentMinutes / (this.activityItems.length);
    this.activityItems.forEach((activityItem) => {
      activityItem.durationMinutes = durationMinutes;
    });
    this.updateForm();
  }

  mouseOverTimes: boolean = false;
  onMouseEnterTimes() {
    this.mouseOverTimes = true;
  }
  onMouseLeaveTimes() {
    this.mouseOverTimes = false;
  }


  onClickClose() {
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  public get currentTime(): moment.Moment {
    return this._now
  }

  public get currentTimelogEntryDuration(): string {
    let minutes: number = moment().diff(this.mostRecentTimelogEntry.endTime, "minutes");

    function plurality(value: number, name: string): string {
      if (value == 1) {
        return "1 " + name + "";
      } else {
        return "" + value + " " + name + "s";
      }
    }

    if (minutes < 60) {
      return plurality(minutes, "minute");
    } else if (minutes >= 60 && minutes < 1440) {
      let hours = Math.floor(minutes / 60);
      minutes = minutes - (hours * 60);

      return plurality(hours, "hour") + ", " + plurality(minutes, "minute");
    } else if (minutes >= 1440) {
      let days = Math.floor(minutes / 1440);
      minutes = minutes - (days * 1440);
      let remainingString: string = "";
      if (minutes > 60) {
        let hours: number = Math.floor(minutes / 60)
        minutes = minutes - (hours * 60);
        remainingString = plurality(hours, "hour") + "," + plurality(minutes, "minute");
      } else {
        remainingString = plurality(minutes, "minute");
      }
      return plurality(days, "day") + ", " + remainingString;
    }


    return "";
  }

  public get saveDisabled(): string {
    if (this.formIsValid) {
      return "";
    } else {
      return "disabled";
    }
  }

}
