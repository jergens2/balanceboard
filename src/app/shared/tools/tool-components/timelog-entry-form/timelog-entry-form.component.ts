import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogService } from '../../../../dashboard/daybook/time-log/timelog.service';
import { TimelogEntry } from '../../../../dashboard/daybook/time-log/timelog-entry-tile/timelog-entry.model';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { ModalService } from '../../../../modal/modal.service';
import { ToolsService } from '../../tools.service';
import { UserDefinedActivity } from '../../../../dashboard/activities/user-defined-activity.model';
import { IActivityListItem } from './activity-list-item.interface';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { TimelogEntryActivity } from '../../../../dashboard/daybook/time-log/timelog-entry-activity.model';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  faTimes = faTimes;

  constructor(private timelogService: TimelogService, private toolsService: ToolsService, private modalService: ModalService) { }

  mostRecentTimelogEntry: TimelogEntry;
  currentTimelogEntry: TimelogEntry;
  timelogEntryForm: FormGroup = new FormGroup({});

  clockSubscription: Subscription = new Subscription();


  private _now = moment();

  initiated: boolean = false;
  formIsValid: boolean = false;
  activityItems: IActivityListItem[] = [];

  chart: any;

  colorBarGridItems: any[] = [];

  ngOnInit() {
    for(let i=0;i<20;i++){
      this.colorBarGridItems.push({
        value: (5*(i+1))
      })
    }
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

    let timelogEntryStart: moment.Moment = moment(this.mostRecentTimelogEntry.endTime);
    let timelogEntryEnd: moment.Moment = moment();
    let timelogEntryMinutes: number = timelogEntryEnd.diff(timelogEntryStart, "minutes");
    let totalMinutes: number = timelogEntryMinutes * (100 / 80);


    chartStartTime = moment(timelogEntryStart).subtract((totalMinutes * 0.1), "minutes");
    chartEndTime = moment(timelogEntryEnd).add((totalMinutes * .1), "minutes");


    let previousTimelogEntrys: TimelogEntry[] = this.timelogService.timelogEntrys.filter((timelogEntry) => {
      let isBefore = timelogEntry.startTime.isBefore(chartStartTime) && timelogEntry.endTime.isAfter(chartStartTime)
      let isAfter = timelogEntry.startTime.isAfter(chartStartTime) && timelogEntry.endTime.isSameOrBefore(timelogEntryStart)
      if (isBefore || isAfter) {
        return timelogEntry;
      }
    });
    previousTimelogEntrys = previousTimelogEntrys.sort((ts1, ts2) => {
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
    previousTimelogEntrys.forEach((timelogEntry) => {
      let minutes: number = 0
      if (timelogEntry.startTime.isBefore(chartStartTime)) {
        minutes = (timelogEntry.endTime.diff(chartStartTime, "minutes"));
      } else {
        minutes = (timelogEntry.endTime.diff(timelogEntry.startTime, "minutes"));
      }

      percentages.push((minutes / totalMinutes) * 100);
    })

    percentages.push((timelogEntryEnd.diff(timelogEntryStart, "minutes") / totalMinutes) * 100);
    percentages.push((chartEndTime.diff(timelogEntryEnd, "minutes") / totalMinutes) * 100);

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
      timelogEntry: TimelogEntry,
      isCurrent: boolean,
      isPrevious: boolean,
      isFuture: boolean,
    }[] = [];
    let currentRow: number = 1;
    previousTimelogEntrys.forEach((previousTimelogEntry) => {
      timeBlocks.push({
        style: {
          "grid-row": "" + currentRow.toFixed(0) + " / span 1",
          "grid-column": "3 / span 1",
        },
        isCurrent: false,
        isPrevious: true,
        isFuture: false,
        timelogEntry: previousTimelogEntry
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
      timelogEntryStart: timelogEntryStart,
      timelogEntryEnd: timelogEntryEnd,
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

    
    this.timelogEntryForm.controls["startTime"].setValue(timelogEntryStart.format('HH:mm'));
    this.timelogEntryForm.controls["startDate"].setValue(timelogEntryStart.format('YYYY-MM-DD'));
    this.timelogEntryForm.controls["endTime"].setValue(timelogEntryEnd.format('HH:mm'));
    this.timelogEntryForm.controls["endDate"].setValue(timelogEntryEnd.format('YYYY-MM-DD'));


    this.initiated = true;
    this.updateForm();
  }

  onClickSaveTimelogEntry() {
    let startTime: string = this.chart.timelogEntryStart.second(0).millisecond(0).toISOString();
    let endTime: string = this.chart.timelogEntryEnd.second(0).millisecond(0).toISOString();
    let description: string = this.timelogEntryForm.controls['description'].value;
    let newTimelogEntry: TimelogEntry = new TimelogEntry("", this.timelogService.userId, startTime, endTime, description);
    this.activityItems.forEach((activityItem) => {
      newTimelogEntry.activities.push(new TimelogEntryActivity(activityItem.activity, ""))
    });
    this.timelogService.saveTimelogEntry(newTimelogEntry);
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  private updateForm() {
    let durationMinutes: number = this.chart.timelogEntryMinutes / (this.activityItems.length);
    let durationPercent = durationMinutes / (this.chart.timelogEntryMinutes) * 100;
    if (this.activityItems.length > 0) {
      this.formIsValid = true;
      this.activityItems.forEach((activityItem) => {
        activityItem.durationMinutes = durationMinutes;
        activityItem.durationPercent = durationPercent;
      });
    }
    
  }

  onActivityValueChanged(activity: UserDefinedActivity) {
    let durationMinutes: number = this.chart.timelogEntryMinutes / (this.activityItems.length + 1);
    let durationPercent = durationMinutes / (this.chart.timelogEntryMinutes) * 100;

    this.activityItems.push({
      activity: activity,
      durationMinutes: durationMinutes,
      durationPercent: durationPercent,
      mouseOver: false,
      isResizing: false,
    });
   
    this.updateForm();
  }



  onMouseDownGrabber(activityItem: IActivityListItem){
    activityItem.isResizing = true;
  }

  onMouseEnterColorBarItem(item: {value: number}, activityItem: IActivityListItem){
    console.log(item.value)
    if(activityItem.isResizing){
      console.log("New value is ", item.value);
    }
  }
  
  onMouseUpColorBarItem(item: {value: number}, activityItem: IActivityListItem){
    activityItem.isResizing = false;
  }

  private recalculatePercentages(){

  }


  onMouseEnterActivity(activityItem: IActivityListItem) {
    activityItem.mouseOver = true;
  }

  onMouseLeaveActivity(activityItem: IActivityListItem) {
    activityItem.mouseOver = false;
  }
  onClickRemoveActivity(activityItem: IActivityListItem) {
    this.activityItems.splice(this.activityItems.indexOf(activityItem), 1);
    let durationMinutes: number = this.chart.timelogEntryMinutes / (this.activityItems.length);
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
