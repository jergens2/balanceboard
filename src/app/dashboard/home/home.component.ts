import * as moment from 'moment';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DayDataService } from '../../shared/document-data/day-data/day-data.service';
import { TimelogService } from '../../shared/document-data/timelog-entry/timelog.service';
import { AuthenticationService } from '../../authentication/authentication.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DayDataService, private timelogService: TimelogService, private authService: AuthenticationService) { }

  ngOnInit() {
    
  }

  ngOnDestroy(){
  }

  // COMMENTING THIS OUT because it has an error with the duration thing.  I might need to revist this., maybe
  // onClickBuildDays(){
  //   this.timelogService.fetchTimelogEntrysByRange$(moment("2018-09-01"), moment("2019-09-01")).subscribe((timelogEntrys: TimelogEntry[])=>{
  //     timelogEntrys = timelogEntrys.filter((ts)=>{if(ts!=null){return ts;}});
  //     timelogEntrys.sort((ts1, ts2)=>{
  //       if(ts1.startTime.isBefore(ts2.startTime)){
  //         return -1;
  //       }
  //       if(ts1.startTime.isAfter(ts2.startTime)){
  //         return 1;
  //       }
  //       return 0;
  //     })
  //     console.log("All timelogentrys:" , timelogEntrys.length);
  //     console.log(timelogEntrys);


  //     let currentDate: moment.Moment = moment(timelogEntrys[0].startTimeISO);
  //     let timelogEntryData: ITimelogEntryDataItem[] = [];
  //     let activityData: IActivityDataItem[] = [];

  //     for(let timelogEntry of timelogEntrys){
  //       // console.log(timelogEntrys.indexOf(timelogEntry), " of ", timelogEntrys.length);


  //       if(moment(timelogEntry.startTime).format('YYYY-MM-DD') == currentDate.format('YYYY-MM-DD') || moment(timelogEntry.endTime).format('YYYY-MM-DD') == currentDate.format('YYYY-MM-DD') ){
  //         timelogEntryData.push({
  //           timelogEntryId: timelogEntry.id,
  //           description: timelogEntry.description,
  //           seconds: timelogEntry.endTime.diff(timelogEntry.startTime, "seconds"),
  //         });
  //         let timelogEntryActivities = timelogEntry.activities;
  //         timelogEntryActivities.forEach((timelogEntryActivity)=>{

  //           let alreadyIn:boolean = false;
  //           for(let activityItem of activityData){
  //             if(activityItem.activityTreeId == timelogEntryActivity.activityTreeId){
  //               alreadyIn = true;
  //               activityItem.seconds += (timelogEntryActivity.duration*60);
  //             }
  //           }
  //           if(!alreadyIn){
  //             activityData.push({
  //               activityTreeId:timelogEntryActivity.activityTreeId,
  //               seconds: timelogEntryActivity.duration*60,
  //             })
  //           }
  //         });


  //       }else{

  //         // console.log("TimelogEntryData:", timelogEntryData);
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
  //         day.timelogEntryData = timelogEntryData;
  //         console.log("Saving day:", day.dateYYYYMMDD);

  //         this.daybookService.saveDayHTTP(day);

  //         timelogEntryData = [];
  //         activityData = [];
  //         timelogEntryData.push({
  //           timelogEntryId: timelogEntry.id,
  //           description: timelogEntry.description,
  //           seconds: timelogEntry.endTime.diff(timelogEntry.startTime, "seconds"),
  //         });
  //         let timelogEntryActivities = timelogEntry.activities;
  //         timelogEntryActivities.forEach((timelogEntryActivity)=>{

  //           let alreadyIn:boolean = false;
  //           for(let activityItem of activityData){
  //             if(activityItem.activityTreeId == timelogEntryActivity.activityTreeId){
  //               alreadyIn = true;
  //               activityItem.seconds += (timelogEntryActivity.duration*60);
  //             }
  //           }
  //           if(!alreadyIn){
  //             activityData.push({
  //               activityTreeId:timelogEntryActivity.activityTreeId,
  //               seconds: timelogEntryActivity.duration*60,
  //             })
  //           }
  //         });


  //         currentDate = moment(timelogEntry.startTime);
  //       }



  //     }
  //         let day: Day = new Day('','', currentDate.format('YYYY-MM-DD'));
  //         day.activityData = activityData;
  //         day.timelogEntryData = timelogEntryData;
  //         console.log("Saving day:", day.dateYYYYMMDD);

  //         this.daybookService.saveDayHTTP(day);

  //   })
    
  // }





}
