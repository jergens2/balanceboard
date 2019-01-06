import { Component, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from '../timelog/timelog.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }

  dayStartTime: moment.Moment;
  dayEndTime: moment.Moment;

  private _currentDate: moment.Moment;

  daybookBodyStyle: any = {};
  hourLabels: any[] = [];
  bookLines: any[] = [];
  nowLineContainerStyle: any = {};
  nowTime: moment.Moment = moment();
  nowTimeContainerStyle: any = {};

  nowSubscription: Subscription = new Subscription();

  ngOnInit() {


    this.timeLogService.currentDate$.subscribe((changedDate: moment.Moment) => {
      this._currentDate = moment(changedDate);
      this.dayStartTime = moment(this._currentDate).hour(7).minute(30).second(0).millisecond(0);
      this.dayEndTime = moment(this._currentDate).hour(22).minute(30).second(0).millisecond(0);

      this.nowSubscription.unsubscribe();
      this.nowSubscription = timer(0,60000).subscribe(()=>{
        this.buildDisplay();
      })
      
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

    let hourLabels: any[] = [];
    let gridLines: any[] = [];

    let gridIndex: number = 1;

    let now = moment();
    let nowLineStyle: any = {};
    let nowTimeContainerStyle: any = {};

    while (currentTime.isSameOrBefore(endTime)) {

      /*
        There is a bug where if now is greater than dayEndTime then this following if block does not fire and the now line does not display properly. 
      */
      let segmentEnd = moment(currentTime).add(30,'minutes');
      if(moment(now).isAfter(currentTime) && moment(now).isBefore(segmentEnd)){
        
        //need to update the now with an observable to move every so many minutes
        let nowLinePercentage: number = 1;
        let lineSeconds = moment(now).diff(moment(currentTime), 'seconds');
        

        nowLinePercentage = ((lineSeconds / (30 * 60)) * 100);
        let lineGridTemplateRows = "" + nowLinePercentage.toFixed(0) + "% " +  (100-nowLinePercentage).toFixed(0) + "%";
        nowLineStyle = { "grid-row":"" + gridIndex + " / span 1", "grid-template-rows": lineGridTemplateRows };

        let nowTimePercentage: number = 1;
        let nowTimeSeconds = moment(now).diff(moment(currentTime).subtract(30,'minutes'), 'seconds');

        nowTimePercentage = ((nowTimeSeconds / (30 * 60 * 3)) * 100);
        let nowTimeGridTemplateRows = "" + nowTimePercentage.toFixed(0) + "%" + (100-nowTimePercentage).toFixed(0) + "%";

        nowTimeContainerStyle = { "grid-row":"" + (gridIndex-1) + " / span 3", "grid-column":"1 / span 1", "grid-template-rows": nowTimeGridTemplateRows };
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

    this.nowLineContainerStyle = nowLineStyle;
    this.nowTimeContainerStyle = nowTimeContainerStyle;
    this.nowTime = now;
  }


  ngOnDestroy(){
    this.nowSubscription.unsubscribe();
  }

}
