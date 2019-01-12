import { Component, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from '../timelog/timelog.service';
import { Subscription, timer } from 'rxjs';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }

  faCalendar = faCalendarAlt;
  ifCalendarInside:boolean = false;

  dayStartTime: moment.Moment;
  dayEndTime: moment.Moment;

  
  /* bed time is the time you start trying to go to sleep */
  /* fall asleep time is the time that you are aiming to be sleeping by */ 
  wakeUpTomorrowTime: moment.Moment;
  bedTime: moment.Moment;
  fallAsleepTime: moment.Moment;


  private _currentDate: moment.Moment;

  daybookBodyStyle: any = {};
  hourLabels: any[] = [];
  bookLines: any[] = [];
  nowLineContainerStyle: any = {};
  nowTime: moment.Moment = moment();
  nowTimeContainerStyle: any = {};

  bedTimeStyle: any = {};
  bedTimeString: string = "";

  nowSubscription: Subscription = new Subscription();

  ngOnInit() {



    this.timeLogService.currentDate$.subscribe((changedDate: moment.Moment) => {
      if(changedDate != null){
        this._currentDate = moment(changedDate);

        // this.fallAsleepTime = moment(this._currentDate).hour(23).minute(30).second(0).millisecond(0);
        this.bedTime = moment(this._currentDate).hour(22).minute(30).second(0).millisecond(0);
  
        this.dayStartTime = moment(this._currentDate).hour(7).minute(30).second(0).millisecond(0);
        this.dayEndTime = moment(this._currentDate).hour(22).minute(30).second(0).millisecond(0);
  
        this.nowSubscription.unsubscribe();
        this.nowSubscription = timer(0,60000).subscribe(()=>{
          this.buildDisplay();
        })
      }
      
      
    })



  }

  buildDisplay() {
    let hour: number = 0;
    hour = this.dayStartTime.hour();

    let currentTime = moment(this.dayStartTime).subtract(30, 'minutes');
    if (currentTime.minute() <= 15) {
      currentTime.minute(0);
    } else if (currentTime.minute() > 15 && currentTime.minute() <= 45) {
      currentTime.minute(30);
    } else {
      currentTime.minute(60);
    }

    let endTime = moment(this.dayEndTime).add(30, 'minutes');
    // let endTime = moment(this.dayEndTime);

    let hourLabels: any[] = [];
    let gridLines: any[] = [];

    let gridIndex: number = 1;

    let now = moment();
    let nowLineContainerStyle: any = {};
    let nowTimeContainerStyle: any = {};
    let bedTimeStyle: any = {};

    function getGridTemplateRowsStyle(referenceTime: moment.Moment, currentSegmentTime: moment.Moment, rows: number): string {
      let percentage: number = 1;
      let seconds = moment(referenceTime).diff(moment(currentSegmentTime), 'seconds');
      

      percentage = ((seconds / (30 * 60 * rows)) * 100);
      let gridTemplateRows = "" + percentage.toFixed(0) + "% " +  (100-percentage).toFixed(0) + "%";
      return gridTemplateRows;
    }

    while (currentTime.isSameOrBefore(endTime)) {
      /*
        There is a bug where if now is greater than dayEndTime then this following if block does not fire and the now line does not display properly. 
      */
      let segmentEnd = moment(currentTime).add(30,'minutes');
      if(moment(now).isAfter(currentTime) && moment(now).isSameOrBefore(segmentEnd)){
        nowLineContainerStyle = { "grid-row":"" + gridIndex + " / span 1", "grid-template-rows": getGridTemplateRowsStyle(now, currentTime, 1) };
        nowTimeContainerStyle = { "grid-row":"" + (gridIndex-1) + " / span 3", "grid-column":"1 / span 1", "grid-template-rows": getGridTemplateRowsStyle(now, moment(currentTime).subtract(30,'minutes'), 3) };
      }
      if(moment(this.bedTime).isAfter(currentTime) && moment(this.bedTime).isSameOrBefore(segmentEnd)){
        bedTimeStyle = { "grid-row":"" + (gridIndex+1) + " / -1 ", "grid-template-rows": getGridTemplateRowsStyle(this.bedTime, currentTime, 1)}
      }

      let gridLine = {
        "line": gridIndex,
        "style": { "grid-column": " 2 / span 2", "grid-row": "" + gridIndex + " / span 1"}
      };
      gridLines.push(gridLine);

      if (currentTime.minute() != 30) {
        let hourLabel = {
          "time": currentTime.format("h a"),
          "style": { "grid-column": "1 / span 1", "grid-row": "" + gridIndex + " / span 2" }
        };
        if(gridIndex == 1 ){
          hourLabel = {
            "time": '',
            "style": { "grid-column": "1 / span 2", "grid-row": "" + gridIndex + " / span 2" }
          };
        }
        hourLabels.push(hourLabel);
      }
      currentTime.add(30, 'minutes');
      gridIndex += 1;
    }

    
    this.daybookBodyStyle = { "display":"grid", "grid-template-rows": "repeat(" + gridIndex.toFixed(0) + ", 1fr)" }
    this.hourLabels = hourLabels;
    this.bookLines = gridLines;

    this.nowLineContainerStyle = nowLineContainerStyle;
    this.nowTimeContainerStyle = nowTimeContainerStyle;
    this.nowTime = now;


    this.bedTimeString = this.calculateBedTimeString(now);

    this.bedTimeStyle = bedTimeStyle;
  }

  calculateBedTimeString(now: moment.Moment): string{
    let minutes = Math.abs( Math.floor(moment(now).diff(moment(this.bedTime),'minutes')) );
    let hours = Math.floor(minutes / 60) 
    minutes = minutes - (hours * 60);

    if(moment(now).isBefore(moment(this.bedTime).subtract(3,'hours'))){
      return "Bed time: " + moment(this.bedTime).format('hh:mm a');
    }else if(moment(now).isBefore(moment(this.bedTime).subtract(1,'minutes'))){
      if(hours > 0 && minutes > 0){
        return hoursString(hours) + " and " + minutesString(minutes) + " until bed time";
      }else if(minutes > 0){
        return minutesString(minutes) + " until bed time";
      }else if(hours > 0){
        return hoursString(hours) + " until bed time";
      }
    }else if(moment(now).isAfter(moment(this.bedTime).subtract(1,'minutes')) && moment(now).isBefore(moment(this.bedTime).add('1 minutes'))){
      return "It's bedtime.  Go to bed";
    }else{
      if(hours > 0 && minutes > 0){
        return "It's " + hoursString(hours) + " and " + minutesString(minutes) + " past bed time.  Go to bed.";
      }else if(minutes > 0){
        return "It's " + minutesString(minutes) + " past bed time.  Go to bed.";
      }else if(hours > 0){
        return "It's " + hoursString(hours) + " past bed time.  Go to bed.";
      }
    }



    function minutesString(minutes: number): string{
      if(minutes == 0){
        return "";
      }else if(minutes == 1){
        return "1 minute";
      }else{
        return "" + minutes + " minutes";
      }
    }
    function hoursString(hours: number): string{
      if(hours == 0){
        return "";
      }else if(hours == 1){
        return "1 hour";
      }else{
        return "" + hours + " hours";
      }
    }


  }

  ngOnDestroy(){
    this.nowSubscription.unsubscribe();
  }


  onClickToggleCalendar(){
    this.ifCalendarInside = !this.ifCalendarInside;
  }

}
