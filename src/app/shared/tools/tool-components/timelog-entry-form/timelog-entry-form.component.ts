import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogService } from '../../../../dashboard/daybook/time-log/timelog.service';
import { TimeSegment } from '../../../../dashboard/daybook/time-log/time-segment-tile/time-segment.model';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { ModalService } from '../../../../modal/modal.service';
import { ToolsService } from '../../tools.service';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  // @Input() timelogEntry 

  constructor(private timelogService: TimelogService, private toolsService: ToolsService, private modalService: ModalService) { }

  mostRecentTimelogEntry: TimeSegment;
  currentTimelogEntry: TimeSegment;
  timelogEntryForm: FormGroup;

  clockSubscription: Subscription = new Subscription();

  
  private _now = moment();
  


  chart: any;

  ngOnInit() {
    this.mostRecentTimelogEntry = this.timelogService.mostRecentTimelogEntry;
    
    this.timelogEntryForm = new FormGroup({
      
    });

    this.clockSubscription = timer(0,1000).subscribe(()=>{
      this._now = moment();
      this.buildChart();
    })
  }
  ngOnDestroy(){
    this.clockSubscription.unsubscribe();
  }

  private buildChart(){

    let timeSegmentStart: moment.Moment = moment(this.mostRecentTimelogEntry.endTime);
    let timeSegmentEnd: moment.Moment = moment();

    let chartStartTime: moment.Moment;
    if(timeSegmentStart.minute() >= 30){
      chartStartTime = moment(timeSegmentStart).minute(0);  
    }else{
      chartStartTime = moment(timeSegmentStart).minute(0).subtract(30, "minutes");
    }

    let chartEndTime: moment.Moment;
    if(timeSegmentEnd.minute() < 30){
      chartEndTime = moment(timeSegmentEnd).minute(30).add(30, "minutes");
    }else{
      chartEndTime = moment(timeSegmentEnd).minute(60).add(30, "minutes");
    }

    let previousTimeSegments: TimeSegment[] = this.timelogService.timeSegments.filter((timeSegment)=>{
      let isBefore = timeSegment.startTime.isBefore(chartStartTime) && timeSegment.endTime.isAfter(chartStartTime)
      let isAfter = timeSegment.startTime.isAfter(chartStartTime) && timeSegment.endTime.isSameOrBefore(timeSegmentStart)
      if(isBefore || isAfter){
        return timeSegment;
      }
    });
    previousTimeSegments = previousTimeSegments.sort((ts1, ts2)=>{
      if(ts1.startTime.isBefore(ts2.startTime)){
        return -1;
      }
      if(ts1.startTime.isAfter(ts2.startTime)){
        return 1;
      }
      return 0;
    })

    

    let totalMinutes: number = moment(chartEndTime).diff(chartStartTime, "minutes");

    let percentages: number[] = [];
    previousTimeSegments.forEach((timeSegment)=>{
      let minutes: number = 0
      if(timeSegment.startTime.isBefore(chartStartTime)){
        minutes = (timeSegment.endTime.diff(chartStartTime, "minutes"));
      }else{
        minutes = (timeSegment.endTime.diff(timeSegment.startTime, "minutes"));
      }

      percentages.push( (minutes/totalMinutes)*100);
    })

    percentages.push((timeSegmentEnd.diff(timeSegmentStart, "minutes")/ totalMinutes) * 100);
    percentages.push((chartEndTime.diff(timeSegmentEnd, "minutes")/totalMinutes) * 100);

    let gridTemplateRows: string = "";
    percentages.forEach((percentage)=>{ gridTemplateRows += " " + percentage.toFixed(2) + "%"; } )
    let startGridRow: string = "" + (percentages.length-1) + " /span 1";
    let endGridRow: string = "" + percentages.length + " / span 1";
    let chartEndRow: string = "" + (percentages.length+1) + " / span 1";

    let timeSegmentStartStyle = {
      "grid-row":startGridRow,
      "grid-column": "1 / span 1",
    }
    let timeSegmentEndStyle = {
      "grid-row":endGridRow,
      "grid-column": "1 / span 1",
    }
    let chartEndStyle = {
      "grid-row":chartEndRow,
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
    previousTimeSegments.forEach((previousTimeSegment)=>{
      timeBlocks.push({
        style: {
          "grid-row":""+currentRow.toFixed(0)+" / span 1",
          "grid-column":"3 / span 1",
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
        "grid-row":""+currentRow.toFixed(0)+" / span 1",
        "grid-column":"3 / span 1",
      },
      isCurrent: true,
      isPrevious: false,
      isFuture: false,
      timeSegment: null,
    });
    currentRow++;
    timeBlocks.push({
      style: {
        "grid-row":""+currentRow.toFixed(0)+" / span 1",
        "grid-column":"3 / span 1",
      },
      isCurrent: false,
      isPrevious: false,
      isFuture: true,
      timeSegment: null,
    });
    
    console.log("timeblocks is ", timeBlocks);

    let chart: any = {
      
      gridTemplateRows:gridTemplateRows,
      percentages: percentages,


      startTime: chartStartTime,
      endTime: chartEndTime,
      timeBlocks: timeBlocks,
      timeSegmentStart: timeSegmentStart,
      timeSegmentEnd: timeSegmentEnd,

      timeSegmentStartStyle: timeSegmentStartStyle,
      timeSegmentEndStyle: timeSegmentEndStyle,
      chartEndStyle: chartEndStyle,

    };

    // let currentTimelogEntry: TimeSegment = new TimeSegment('', this.timelogService.userId, chartMiddleTime.toISOString(), chartEndTime.toISOString(), '')

    // this.currentTimelogEntry = currentTimelogEntry;
    this.chart = chart;
  }

  onClickSaveTimelogEntry(){

  }

  onClickClose() {
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  public get currentTime(): moment.Moment{
    return this._now
  }

  public get currentTimelogEntryDuration(): string{
    let minutes: number = moment().diff(this.mostRecentTimelogEntry.endTime, "minutes");

    function plurality(value: number, name: string): string{
      if(value == 1){
        return "1 "+name+"";
      }else{
        return ""+value+" " + name + "s";
      }
    }

    if(minutes < 60){
      return plurality(minutes, "minute");
    }else if(minutes >= 60 && minutes < 1440){
      let hours = Math.floor(minutes/60);
      minutes = minutes - (hours*60);

      return plurality(hours, "hour") + ", " + plurality(minutes, "minute");
    }else if(minutes >= 1440){
      let days = Math.floor(minutes/1440);
      minutes = minutes - (days*1440);
      let remainingString: string = "";
      if(minutes > 60){
        let hours: number = Math.floor(minutes/60)
        minutes = minutes - (hours*60);
        remainingString = plurality(hours, "hour") + "," + plurality(minutes, "minute");
      }else{
        remainingString = plurality(minutes, "minute");
      }
      return plurality(days, "day") +", "+remainingString;
    }


    return "";
  }

}
