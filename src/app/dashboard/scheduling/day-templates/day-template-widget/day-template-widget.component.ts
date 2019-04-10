import { Component, OnInit, Input } from '@angular/core';
import { DayTemplate } from '../day-template.model';
import { ITemplateTimeRange } from '../template-time-range.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-day-template-widget',
  templateUrl: './day-template-widget.component.html',
  styleUrls: ['./day-template-widget.component.css']
})
export class DayTemplateWidgetComponent implements OnInit {

  constructor() { }


  @Input() template: DayTemplate;



  hours: any[] = [];
  timeRangeSections: {timeRange: ITemplateTimeRange, type: string}[] = [];
  bodyStyle: any = null;

  ngOnInit() {

    console.log("template is ", this.template)




    this.template.discretionaryTimeRanges.forEach((tr)=>{
      this.timeRangeSections.push({timeRange: tr, type: "Discretionary"});
    });
    this.template.nonDiscretionaryTimeRanges.forEach((tr)=>{
      this.timeRangeSections.push({timeRange: tr, type: "Non Discretionary"});
    });
    this.template.sleepTimeRanges.forEach((tr)=>{
      this.timeRangeSections.push({timeRange: tr, type: "Sleep"});
    });

    this.timeRangeSections.sort((sectionA, sectionB)=>{

      if(moment().hour(sectionA.timeRange.startHour).minute(sectionA.timeRange.startMinute).isBefore(moment().hour(sectionB.timeRange.startHour).minute(sectionB.timeRange.startMinute)) ){
        return -1;
      }else if(moment().hour(sectionA.timeRange.startHour).minute(sectionA.timeRange.startMinute).isAfter(moment().hour(sectionB.timeRange.startHour).minute(sectionB.timeRange.startMinute)) ){
        return 1;
      }
      return 0;

    });


    let gridTemplateRows: string = "";
    let percentages: number[] = [];
    let sumOfMinutes: number = 0;
    let totalMinutes: number = 24*60;
    this.timeRangeSections.forEach((section)=>{
      let startTime: moment.Moment = moment().hour(section.timeRange.startHour).minute(section.timeRange.startMinute).second(0).millisecond(0);
      let endTime: moment.Moment = moment().hour(section.timeRange.endHour).minute(section.timeRange.endMinute).second(0).millisecond(0);
      let diff: number = endTime.diff(startTime, "minutes");
      sumOfMinutes += diff;
      percentages.push( (diff/totalMinutes) * 100);
    })

    console.log("sumOfMinutes should == totalMinutes: ", sumOfMinutes, totalMinutes);
    let psum: number = 0;
    percentages.forEach(p=>{psum+=p});

    console.log("psum should be 100: ", psum);
    if(psum != 100){
      console.log("bigly error")
      console.log(percentages);
    }
    
    percentages.forEach((percentage:number)=>{
      gridTemplateRows += "" + percentage + "% ";
    })

    this.bodyStyle = { "grid-template-rows": gridTemplateRows };

    console.log(this.timeRangeSections);

  }


  sectionTimeRange(section: {timeRange: ITemplateTimeRange, type: string}): string{
    let startTime: moment.Moment = moment().hour(section.timeRange.startHour).minute(section.timeRange.startMinute).second(0).millisecond(0)
    let meridiem: string = "a";
    if(startTime.hour() >= 12){
      meridiem = "p";
    }
    return (startTime.format('h:mm') + " " + meridiem); 
  }

  


}
