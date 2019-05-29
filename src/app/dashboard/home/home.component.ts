import * as moment from 'moment';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DaybookService } from '../daybook/daybook.service';
import { TimelogService } from '../daybook/time-log/timelog.service';
import { TimeSegment } from '../daybook/time-log/time-segment-tile/time-segment.model';
import { Day } from '../daybook/day/day.model';
import { AuthenticationService } from '../../authentication/authentication.service';
import { ITimeSegmentDataItem } from '../daybook/day/time-segment-data.interface';
import { IActivityDataItem } from '../daybook/day/activity-data-item.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookService, private timelogService: TimelogService, private authService: AuthenticationService) { }

  ngOnInit() {
    
  }

  ngOnDestroy(){
  }

  // COMMENTING THIS OUT because it has an error with the duration thing.  I might need to revist this., maybe
  // onClickBuildDays(){
  //   this.timelogService.fetchTimeSegmentsByRange$(moment("2018-09-01"), moment("2019-09-01")).subscribe((timeSegments: TimeSegment[])=>{
  //     timeSegments = timeSegments.filter((ts)=>{if(ts!=null){return ts;}});
  //     timeSegments.sort((ts1, ts2)=>{
  //       if(ts1.startTime.isBefore(ts2.startTime)){
  //         return -1;
  //       }
  //       if(ts1.startTime.isAfter(ts2.startTime)){
  //         return 1;
  //       }
  //       return 0;
  //     })
  //     console.log("All timesegments:" , timeSegments.length);
  //     console.log(timeSegments);


  //     let currentDate: moment.Moment = moment(timeSegments[0].startTimeISO);
  //     let timeSegmentData: ITimeSegmentDataItem[] = [];
  //     let activityData: IActivityDataItem[] = [];

  //     for(let timeSegment of timeSegments){
  //       // console.log(timeSegments.indexOf(timeSegment), " of ", timeSegments.length);


  //       if(moment(timeSegment.startTime).format('YYYY-MM-DD') == currentDate.format('YYYY-MM-DD') || moment(timeSegment.endTime).format('YYYY-MM-DD') == currentDate.format('YYYY-MM-DD') ){
  //         timeSegmentData.push({
  //           timeSegmentId: timeSegment.id,
  //           description: timeSegment.description,
  //           seconds: timeSegment.endTime.diff(timeSegment.startTime, "seconds"),
  //         });
  //         let timeSegmentActivities = timeSegment.activities;
  //         timeSegmentActivities.forEach((timeSegmentActivity)=>{

  //           let alreadyIn:boolean = false;
  //           for(let activityItem of activityData){
  //             if(activityItem.activityTreeId == timeSegmentActivity.activityTreeId){
  //               alreadyIn = true;
  //               activityItem.seconds += (timeSegmentActivity.duration*60);
  //             }
  //           }
  //           if(!alreadyIn){
  //             activityData.push({
  //               activityTreeId:timeSegmentActivity.activityTreeId,
  //               seconds: timeSegmentActivity.duration*60,
  //             })
  //           }
  //         });


  //       }else{

  //         // console.log("TimeSegmentData:", timeSegmentData);
  //         // console.log("ActivityData", activityData);

  //         activityData.sort((a1, a2)=>{
  //           if(a1.seconds > a2.seconds){
  //             return -1;
  //           }
  //           if(a1.seconds < a2.seconds){
  //             return 1;
  //           }
  //           return 0;
  //         })

  //         let day: Day = new Day('','', currentDate.format('YYYY-MM-DD'));
  //         day.activityData = activityData;
  //         day.timeSegmentData = timeSegmentData;
  //         console.log("Saving day:", day.dateYYYYMMDD);

  //         this.daybookService.saveDayHTTP(day);

  //         timeSegmentData = [];
  //         activityData = [];
  //         timeSegmentData.push({
  //           timeSegmentId: timeSegment.id,
  //           description: timeSegment.description,
  //           seconds: timeSegment.endTime.diff(timeSegment.startTime, "seconds"),
  //         });
  //         let timeSegmentActivities = timeSegment.activities;
  //         timeSegmentActivities.forEach((timeSegmentActivity)=>{

  //           let alreadyIn:boolean = false;
  //           for(let activityItem of activityData){
  //             if(activityItem.activityTreeId == timeSegmentActivity.activityTreeId){
  //               alreadyIn = true;
  //               activityItem.seconds += (timeSegmentActivity.duration*60);
  //             }
  //           }
  //           if(!alreadyIn){
  //             activityData.push({
  //               activityTreeId:timeSegmentActivity.activityTreeId,
  //               seconds: timeSegmentActivity.duration*60,
  //             })
  //           }
  //         });


  //         currentDate = moment(timeSegment.startTime);
  //       }



  //     }
  //         let day: Day = new Day('','', currentDate.format('YYYY-MM-DD'));
  //         day.activityData = activityData;
  //         day.timeSegmentData = timeSegmentData;
  //         console.log("Saving day:", day.dateYYYYMMDD);

  //         this.daybookService.saveDayHTTP(day);

  //   })
    
  // }





}
