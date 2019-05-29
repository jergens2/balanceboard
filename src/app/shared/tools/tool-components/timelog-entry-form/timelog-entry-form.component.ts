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
    let chartStartTime: moment.Moment = moment(this.mostRecentTimelogEntry.startTime);
    let chartMiddleTime: moment.Moment = moment(this.mostRecentTimelogEntry.endTime);
    let chartEndTime: moment.Moment = moment();

    let totalMinutes: number = moment(chartEndTime).diff(chartStartTime, "minutes");
    let previousTLEPercent: number = (this.mostRecentTimelogEntry.duration/totalMinutes)*100;
    let currentTLEPercent: number = 100-previousTLEPercent;

    if(previousTLEPercent < 15){
      previousTLEPercent = 15;
      currentTLEPercent = 85;
    }
    if(currentTLEPercent < 15){
      previousTLEPercent = 85;
      currentTLEPercent = 15;
    }

    let chart: any = {
      previousTimelogEntryPercent: previousTLEPercent,
      currentTimelogEntryPercent: currentTLEPercent,
      gridTemplateRows: "" + previousTLEPercent.toFixed(1) + "% " + currentTLEPercent.toFixed(1)  + "% auto" ,
      startTime: chartStartTime,
      middleTime: chartMiddleTime,
      endTime: chartEndTime,

    };

    let currentTimelogEntry: TimeSegment = new TimeSegment('', this.timelogService.userId, chartMiddleTime.toISOString(), chartEndTime.toISOString(), '')

    this.currentTimelogEntry = currentTimelogEntry;
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
