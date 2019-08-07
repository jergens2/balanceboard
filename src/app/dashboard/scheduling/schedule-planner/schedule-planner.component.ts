import { Component, OnInit } from '@angular/core';
import { SizeService } from '../../../shared/app-screen-size/size.service';
import { AppScreenSize } from '../../../shared/app-screen-size/app-screen-size.enum';
import * as moment from 'moment';
import { ITimeBlock } from './time-block.interface';
import { ScheduleItem } from './schedule-item.class';
import { SchedulingService } from '../scheduling.service';
import { ItemSelection } from './item-selection.class';
import { DayTemplatesService } from '../day-templates/day-templates.service';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-schedule-planner',
  templateUrl: './schedule-planner.component.html',
  styleUrls: ['./schedule-planner.component.css']
})
export class SchedulePlannerComponent implements OnInit {

  constructor(private sizeService: SizeService, private schedulingService: SchedulingService, private dayTemplateService: DayTemplatesService) { }

  faSpinner = faSpinner;

  size: AppScreenSize;
  scheduleItems: ScheduleItem[] = [];

  plannerGraphic: {
    daysOfWeek: { day: moment.Moment, style: any }[],
    hourLabels: { hour: moment.Moment, label: string, style: any }[],
    timeBlocks: ITimeBlock[],
    graphicStyle: any,
    scheduleItems: ScheduleItem[]
  } = null;

  loading: boolean = true;;

  ngOnInit() {
    this.size = this.sizeService.appScreenSize;
    this.sizeService.appScreenSize$.subscribe((size: AppScreenSize) => {
      this.size = size;
    });
    


    this.dayTemplateService.dayTemplates$.subscribe((dayTemplates)=>{
      if(dayTemplates.length > 0){
        console.log("dayTemplates received: ", dayTemplates);
        this.buildPlannerGraphic();
        this.loading = false;
      }else{

      }
    });
    // this.schedulingService.scheduleItems$.subscribe((scheduleItems: ScheduleItem[])=>{
    //   this.scheduleItems = scheduleItems;
    // })
    

  }


  



  private buildPlannerGraphic() {
    let graphic: any = {};

    let totalHoursPerDay: number = 16;
    
    let totalHeightPx: number = 800;
    let timeBlockDurationMinutes: number = 10;
    let rows: number = (60 / timeBlockDurationMinutes) * totalHoursPerDay
    let timeBlockHeightPx: number = totalHeightPx / rows;
    

    


    let graphicStyle: any = {
      "grid-template-rows": "auto repeat("+rows+", "+timeBlockHeightPx+"px)",
      "height":""+totalHeightPx+"px",
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


    

    let timeBlocks: ITimeBlock[] = [];   

    for (let currentDay = moment().startOf("week"); currentDay.isBefore(moment().endOf("week")); currentDay = moment(currentDay).add(1, "days").hour(7).minute(30).second(0).millisecond(0)) {
      let startOfDay = moment(currentDay).hour(7).minute(30).second(0).millisecond(0);
      let endOfDay: moment.Moment = moment(startOfDay).add(totalHoursPerDay, "hours");
      for(let currentTime = moment(startOfDay); currentTime.isBefore(endOfDay); currentTime = moment(currentTime).add(timeBlockDurationMinutes, "minutes")){
        let row = 2 + (moment(currentTime).diff(moment(startOfDay), "minutes") / timeBlockDurationMinutes);
        let blockEndTime: moment.Moment = moment(currentTime).add(timeBlockDurationMinutes, "minutes");
        let borderBottom: string = "";
        if(blockEndTime.minute() == 30 || blockEndTime.minute() == 0){
          borderBottom = "1px solid rgb(240, 240, 240)";
        }
        let block:ITimeBlock = {
          startTime: currentTime,
          endTime: blockEndTime,
          style: {
            "grid-row": "" + row + " / span 1",
            "grid-column": "" + (currentDay.day()+2) + " / span 1",
            "border-bottom": borderBottom,
          },
          gridColumnStart: (currentDay.day()+2),
          gridRowStart: row,
          isHighlighted: false,
        }

        timeBlocks.push(block);
      }
    }

    let hourLabels: { hour: moment.Moment, label: string, style: any }[] = [];

    let startTime: moment.Moment = moment().hour(7).minute(30).second(0).millisecond(0);
    let endTime: moment.Moment = moment(startTime).add(totalHoursPerDay, "hours");
    for (let currentHour: moment.Moment = moment(startTime); currentHour.isBefore(endTime); currentHour = moment(currentHour).add(timeBlockDurationMinutes, "minutes")) {
      let label: string = "";
      if (currentHour.minute() == 0) {
        label = currentHour.format('h A');
      }
      hourLabels.push({
        hour: currentHour,
        label: label,
        style: {

        }
      })
    }


    let scheduleItems: ScheduleItem[] = [];

    graphic = {
      daysOfWeek: daysOfWeek,
      hourLabels: hourLabels,
      timeBlocks: timeBlocks,
      graphicStyle: graphicStyle,
      scheduleItems: scheduleItems
    }
    this.plannerGraphic = graphic;
  }



  selection: ItemSelection = null; 
  isGrabbing: boolean = false;
  
  onMouseDownTimeBlock(block: ITimeBlock){
    this.isGrabbing = true;
    let selection: ItemSelection = new ItemSelection(this.plannerGraphic.timeBlocks); 
    selection.mouseDownBlock(block);
    this.selection = selection;
  }
  
  onMouseUpGraphic(){
    if(this.selection){
      this.selection.mouseUp();
    }
    this.isGrabbing = false;
  }
  
  onMouseEnterTimeBlock(block: ITimeBlock){
    if(this.selection){
      this.selection.mouseEnterBlock(block);
    }
  }
  onMouseLeaveGraphic(){
    this.selection = null; 
  }

}
