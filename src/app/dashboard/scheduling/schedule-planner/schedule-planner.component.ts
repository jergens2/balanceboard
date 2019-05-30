import { Component, OnInit } from '@angular/core';
import { SizeService } from '../../../shared/app-screen-size/size.service';
import { AppScreenSize } from '../../../shared/app-screen-size/app-screen-size.enum';
import * as moment from 'moment';
import { ITimeBlock } from './time-block.interface';

@Component({
  selector: 'app-schedule-planner',
  templateUrl: './schedule-planner.component.html',
  styleUrls: ['./schedule-planner.component.css']
})
export class SchedulePlannerComponent implements OnInit {

  constructor(private sizeService: SizeService) { }

  size: AppScreenSize;

  plannerGraphic: any;

  ngOnInit() {
    this.sizeService.appScreenSize$.subscribe((size: AppScreenSize) => {
      this.size = size;
    })
    this.size = this.sizeService.appScreenSize;
    this.buildPlannerGraphic();
  }


  



  private buildPlannerGraphic() {
    let graphic: any = {};

    let timeBlockHeight: number = 20;

    let graphicStyle: any = {
      "grid-template-rows": "auto repeat(32, "+timeBlockHeight+"px)",
    };

    let daysOfWeek: { day: moment.Moment, style: any }[] = [];

    let dayOfWeek: { day: moment.Moment, style: any } = {
      day: moment().startOf("week"),
      style: {
        "grid-column": "2 / span 1",
      }
    }
    daysOfWeek.push(dayOfWeek);
    for (let i = 1; i < 7; i++) {

      dayOfWeek = {
        day: moment(dayOfWeek.day).add(1, "day"),
        style: {
          "grid-column": "" + (i + 2) + " / span 1",
        }
      }
      daysOfWeek.push(dayOfWeek);
    }


    let hourLabels: { hour: moment.Moment, label: string, style: any }[] = [];

    let startTime: moment.Moment = moment().hour(7).minute(30).second(0).millisecond(0);
    let endTime: moment.Moment = moment(startTime).add(16, "hours");
    for (let currentHour: moment.Moment = moment(startTime); currentHour.isBefore(endTime); currentHour = moment(currentHour).add(30, "minutes")) {
      let label: string = "";
      if (currentHour.minute() == 0) {
        label = currentHour.format('h:mm a');
      }
      hourLabels.push({
        hour: currentHour,
        label: label,
        style: {

        }
      })
    }


    let timeBlocks: ITimeBlock[] = [];



    for (let currentDay = moment().startOf("week"); currentDay.isBefore(moment().endOf("week")); currentDay = moment(currentDay).add(1, "days").hour(7).minute(30).second(0).millisecond(0)) {
      let startOfDay = moment(currentDay).hour(7).minute(30).second(0).millisecond(0);
      let endOfDay: moment.Moment = moment(startOfDay).add(16, "hours");
      for(let currentTime = moment(startOfDay); currentTime.isBefore(endOfDay); currentTime = moment(currentTime).add(30, "minutes")){
        let row = 2 + (moment(currentTime).diff(moment(startOfDay), "minutes") / 30);
        let block:ITimeBlock = {
          startTime: currentTime,
          endTime: moment(currentTime).add(30, "minutes"),
          style: {
            "grid-row": "" + row + " / span 1",
            "grid-column": "" + (currentDay.day()+2) + " / span 1",
          },
          isSelected: false,
        }

        timeBlocks.push(block);
      }
    }

    




    graphic = {
      daysOfWeek: daysOfWeek,
      hourLabels: hourLabels,
      timeBlocks: timeBlocks,
      graphicStyle: graphicStyle,
    }


    this.plannerGraphic = graphic;
  }

  anchorBlock: ITimeBlock = null;
  currentlySelecting: boolean = false;
  selection: ITimeBlock[] = [];

  onMouseDownTimeBlock(block: ITimeBlock){
    this.currentlySelecting = true;
    this.anchorBlock = block;
    this.plannerGraphic.timeBlocks.forEach((timeBlock:ITimeBlock)=>{
      timeBlock.isSelected = false;
    })
    this.selection = [];
  }
  onMouseUpTimeBlock(block: ITimeBlock){
    if(this.currentlySelecting){
      if(block == this.anchorBlock){
        this.selection = [block];
      }else{
        let startTime = moment(this.anchorBlock.startTime);
        let endTime = moment(block.endTime);
        if(this.anchorBlock.startTime.isAfter(block.startTime)){
          startTime = moment(block.startTime);
          endTime = moment(this.anchorBlock.endTime);
        }
        


        this.selection = this.plannerGraphic.timeBlocks.filter((timeBlock: ITimeBlock)=>{
          if(timeBlock.startTime.isSameOrAfter(startTime) && timeBlock.endTime.isSameOrBefore(endTime)){
            return timeBlock;
          }
        })

      }
      this.plannerGraphic.timeBlocks.forEach((timeBlock:ITimeBlock)=>{
        timeBlock.isSelected = false;
      })
      this.selection.forEach((timeBlock:ITimeBlock)=>{
        timeBlock.isSelected = true;
      })
    }
    
    this.currentlySelecting = false;
    
  }
  onMouseEnterTimeBlock(block: ITimeBlock){
    if(this.currentlySelecting){
      if(block == this.anchorBlock){
        this.selection = [block];
      }else{
        
        let startTime = moment(this.anchorBlock.startTime);
        let endTime = moment(block.endTime);
        if(this.anchorBlock.startTime.isAfter(block.startTime)){
          startTime = moment(block.startTime);
          endTime = moment(this.anchorBlock.endTime);
        }

        this.selection = this.plannerGraphic.timeBlocks.filter((timeBlock: ITimeBlock)=>{
          if(timeBlock.startTime.isSameOrAfter(startTime) && timeBlock.endTime.isSameOrBefore(endTime)){
            return timeBlock;
          }
        })

      }
      this.plannerGraphic.timeBlocks.forEach((timeBlock:ITimeBlock)=>{
        timeBlock.isSelected = false;
      })
      this.selection.forEach((timeBlock:ITimeBlock)=>{
        timeBlock.isSelected = true;
      })
    }

  }

  onMouseLeaveGraphic(){
    this.plannerGraphic.timeBlocks.forEach((timeBlock:ITimeBlock)=>{
      timeBlock.isSelected = false;
    })
    this.selection = [];
    this.currentlySelecting = false;
    this.anchorBlock = null;
  }

}
