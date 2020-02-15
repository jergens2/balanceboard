import * as moment from 'moment';
import { Component, OnInit, OnDestroy } from '@angular/core';


import { AuthenticationService } from '../../authentication/authentication.service';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { RelativeMousePosition } from '../../shared/utilities/relative-mouse-position.class';
import { AdmintoolsService } from './admintools.service';
import { DaybookControllerService } from '../daybook/controller/daybook-controller.service';
import { TimelogEntryItem } from '../daybook/widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimelogEntryActivity } from '../daybook/api/data-items/timelog-entry-activity.interface';
import { DaybookDayItem } from '../daybook/api/daybook-day-item.class';
import { DaybookHttpRequestService } from '../daybook/api/daybook-http-request.service';
import { ActivityCategoryDefinition } from '../activities/api/activity-category-definition.class';
import { ActivityCategoryDefinitionService } from '../activities/api/activity-category-definition.service';
import { UpdateActivityDatabaseItemsService } from '../activities/api/update-activity-database-items.service';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthenticationService,
    private specialService: AdmintoolsService,
    private daybookControllerService: DaybookControllerService,
    private daybookHttpService: DaybookHttpRequestService,
    private activitiesService: ActivityCategoryDefinitionService,
    private updateActivitiesService: UpdateActivityDatabaseItemsService) { }

  faHome = faHome;

  thing: RelativeMousePosition;

  ngOnInit() {
    this.thing = new RelativeMousePosition();

  }

  ngOnDestroy() {
  }


  // public onClickSuperMagicButton() {
  //   // this.updateActivities();
  //   this.doTheDaybookItems();
  // }


  // private updateActivities() {
  //   let activities: ActivityCategoryDefinition[] = this.activitiesService.activitiesTree.allActivities;
  //   console.log("Updating " + activities.length + " activities");


  //   let updatedActivities: ActivityCategoryDefinition[] = this.updateActivitiesService.updateActivities(activities);
  //   updatedActivities.forEach((activity) => {
  //     this.activitiesService.updateActivity(activity);
  //   })
  // }


  // private doTheDaybookItems() {
  //   this.specialService.doTheThing$().subscribe((things) => {
  //     let tles: any[] = things.data as any[];
  //     console.log("number of TLES: " + tles.length);
  //     tles = tles.sort((tle1, tle2) => {
  //       if (tle1.startTimeISO < tle2.startTimeISO) {
  //         return -1;
  //       }
  //       else if (tle1.startTimeISO > tle2.startTimeISO) {
  //         return 1;
  //       }
  //       return 0;
  //     }).filter((tle) => {
  //       let isValid: boolean = true;
  //       if (tle.itleActivities.length < 1) isValid = false;
  //       if (moment(tle.endTimeISO).diff(moment(tle.startTimeISO), "hours") > 24) {
  //         console.log("BIG TLE ", tle)
  //         isValid = false;
  //       }
  //       let activityTreeIds: string[] = tle.itleActivities.map((item) => { return item.activityTreeId; });
  //       if (activityTreeIds.length > 0) {
  //         for (let i = 0; i < activityTreeIds.length; i++) {
  //           if (!this.activitiesService.findActivityByTreeId(activityTreeIds[i])) {
  //             console.log("Could not find activity by id: ")
  //             console.log("  "  + activityTreeIds[i])
  //             isValid = false;
  //           }
  //         }

  //       } else {
  //         isValid = false;
  //       }



  //       return isValid;

  //     });

  //     console.log("TLES reduced and filtered.");
  //     console.log("number of TLES: " + tles.length);

  //     let currentDateYYYYMMDD: string = moment().startOf("year").subtract(1, "month").format("YYYY-MM-DD");
  //     currentDateYYYYMMDD = moment(tles[0].startTimeISO).format("YYYY-MM-DD");
  //     let daybookDayItems: DaybookDayItem[] = [];
  //     let currentDaybookDayItem: DaybookDayItem = new DaybookDayItem(currentDateYYYYMMDD);



  //     console.log("Starting on date:  " + currentDateYYYYMMDD);

  //     for (let i = 0; i < tles.length; i++) {
  //       let timelogEntry: TimelogEntryItem = this.buildTimelogEntryItemFromData(tles[i]);

  //       let isSameDay: boolean = timelogEntry.startTime.format("YYYY-MM-DD") == currentDateYYYYMMDD;
  //       let isFollowingDay: boolean = timelogEntry.startTime.format("YYYY-MM-DD") == moment(currentDateYYYYMMDD).add(1, "days").format("YYYY-MM-DD");
  //       let isTwoOrMoreDaysAfter: boolean = timelogEntry.startTime.diff(moment(currentDateYYYYMMDD), "days") > 1;

  //       let isPreviousDay: boolean = moment(currentDateYYYYMMDD).diff(moment(timelogEntry.startTime), "days") > 0;


  //       if (isFollowingDay) {
  //         daybookDayItems.push(currentDaybookDayItem);
  //         currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, "days").format("YYYY-MM-DD");
  //         currentDaybookDayItem = new DaybookDayItem(currentDateYYYYMMDD);
  //         // console.log("**** Current date changed to: " + currentDateYYYYMMDD);
  //       } else if (isSameDay) {
  //         // normal occurrence
  //         const currentDateStart: moment.Moment = moment(currentDateYYYYMMDD).startOf("day");
  //         const currentDateEnd: moment.Moment = moment(currentDateYYYYMMDD).startOf("day").add(24, "hours");

  //         const startsBeforeEndsBefore: boolean = timelogEntry.startTime.isBefore(currentDateStart) && timelogEntry.endTime.isBefore(currentDateStart);
  //         const startsBeforeEndsDuring: boolean = timelogEntry.startTime.isBefore(currentDateStart) && timelogEntry.endTime.isAfter(currentDateStart) && timelogEntry.endTime.isBefore(currentDateEnd);
  //         const startsBeforeEndsAfter: boolean = timelogEntry.startTime.isBefore(currentDateStart) && timelogEntry.endTime.isAfter(currentDateEnd);
  //         const startsDuringEndsDuring: boolean = timelogEntry.startTime.isSameOrAfter(currentDateStart) && timelogEntry.endTime.isSameOrBefore(currentDateEnd);
  //         const startsDuringEndsAfter: boolean = timelogEntry.startTime.isSameOrAfter(currentDateStart) && timelogEntry.endTime.isAfter(currentDateEnd);
  //         const startsAfterEndsAfter: boolean = timelogEntry.startTime.isAfter(currentDateEnd) && timelogEntry.endTime.isAfter(currentDateEnd);


  //         if (startsBeforeEndsBefore) {
  //           console.log("Error: Starts before and ends before")
  //         } else if (startsBeforeEndsDuring) {
  //           console.log("Error:  Starts before, ends during.")
  //         } else if (startsBeforeEndsAfter) {
  //           console.log("Error: Huh? " + timelogEntry.startTime.format("YYYY-MM-DD hh:mm a") + "   --   " + timelogEntry.endTime.format("YYYY-MM-DD hh:mm a"))
  //         } else if (startsDuringEndsDuring) {
  //           // console.log("Starts during ends during.  Nice!")
  //           currentDaybookDayItem.addTimelogEntryItem(timelogEntry.dataEntryItem);

  //         } else if (startsDuringEndsAfter) {
  //           // console.log("Starts during, ends after.  Nice!")
  //           let thing = this.splitTimelogEntry(timelogEntry, currentDateYYYYMMDD);

  //           thing.sameDayEntries.forEach((sameDayEntry)=>{
  //             currentDaybookDayItem.addTimelogEntryItem(sameDayEntry.dataEntryItem);
  //           })
  //           daybookDayItems.push(currentDaybookDayItem);
  //           currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, "days").format("YYYY-MM-DD");
  //           currentDaybookDayItem = new DaybookDayItem(currentDateYYYYMMDD);
  //           thing.followingDayEntries.forEach((followingDayEntry)=>{
  //             currentDaybookDayItem.addTimelogEntryItem(followingDayEntry.dataEntryItem);
  //           })

  //         } else if (startsAfterEndsAfter) {
  //           console.log("Error: Starts and ends after.")
  //         } else {
  //           console.log("Error: What the fuck: " + timelogEntry.startTime.format("YYYY-MM-DD hh:mm a") + "   --   " + timelogEntry.endTime.format("YYYY-MM-DD hh:mm a"))
  //         }






  //       } else if (isTwoOrMoreDaysAfter) {
  //         daybookDayItems.push(currentDaybookDayItem);
  //         currentDateYYYYMMDD = moment(timelogEntry.startTime).format("YYYY-MM-DD");
  //         console.log("Current date JUMPED to " + currentDateYYYYMMDD)

  //         currentDaybookDayItem = new DaybookDayItem(currentDateYYYYMMDD);
  //       } else if (isPreviousDay) {
  //         console.log("WTF It's a previous day")
  //       } else {
  //         console.log("Error ?")
  //         console.log(timelogEntry.startTime.format("YYYY-MM-DD"), currentDateYYYYMMDD, "diff is " + moment(timelogEntry.startTime).diff(moment(currentDateYYYYMMDD), "days") + " days")
  //       }






  //     }
  //     daybookDayItems.push(currentDaybookDayItem);
  //     console.log("Daybook day items:  " + daybookDayItems.length, daybookDayItems);

  //     daybookDayItems.forEach((day) => {
  //       day = this.validateDayItem(day);
  //     })

  //     this.daybookHttpService.saveMultipleDayItems(daybookDayItems);
  //   });
  // }

  // private splitTimelogEntry(timelogEntry: TimelogEntryItem, dateYYYYMMDD: string): { sameDayEntries: TimelogEntryItem[], followingDayEntries: TimelogEntryItem[] } {
  //   /*
  //   Starts during and ends after.
  //   */

  //   let sameDayEntries: TimelogEntryItem[] = [];
  //   let followingDayEntries: TimelogEntryItem[] = [];

  //   const midnight: moment.Moment = moment(dateYYYYMMDD).startOf("day").add(1, "day");
  //   const midnightPlusOne: moment.Moment = moment(dateYYYYMMDD).startOf("day").add(2, "days");
  //   if(timelogEntry.endTime.isAfter(midnightPlusOne)){
  //     console.log("error with duration");
  //     timelogEntry.endTime = moment(midnightPlusOne);
  //   }




  //   let durationSeconds: number = timelogEntry.durationSeconds;

  //   let currentStart: moment.Moment = moment(timelogEntry.startTime);

  //   timelogEntry.timelogEntryActivities.forEach((activity: TimelogEntryActivity) => {
  //     let currentMSeconds: number = ((activity.percentage / 100) * durationSeconds) * 1000;
  //     let currentEnd: moment.Moment = moment(currentStart).add(currentMSeconds, "milliseconds");

  //     if(timelogEntry.timelogEntryActivities.indexOf(activity) == timelogEntry.timelogEntryActivities.length-1){
  //       currentEnd = moment(timelogEntry.endTime);
  //     }
      

  //     if(currentStart.isBefore(midnight) && currentEnd.isBefore(midnight)){
  //       let sameDayEntry: TimelogEntryItem = new TimelogEntryItem(currentStart, currentEnd);
  //       sameDayEntry.note = timelogEntry.note;
  //       sameDayEntry.timelogEntryActivities = [activity];

  //       sameDayEntries.push(sameDayEntry);

  //     }else if(currentStart.isBefore(midnight) && currentEnd.isAfter(midnight)){

  //       let sameDayEntry: TimelogEntryItem = new TimelogEntryItem(currentStart, midnight);
  //       sameDayEntry.note = timelogEntry.note;
  //       sameDayEntry.timelogEntryActivities = [activity];
  //       sameDayEntries.push(sameDayEntry);


  //       let followingDayEntry: TimelogEntryItem = new TimelogEntryItem(midnight, currentEnd);
  //       followingDayEntry.note = timelogEntry.note;
  //       followingDayEntry.timelogEntryActivities = [activity];
  //       followingDayEntries.push(followingDayEntry);
  //     }else if(currentStart.isSameOrAfter(midnight) && currentEnd.isAfter(midnight)){
  //       let followingDayEntry: TimelogEntryItem = new TimelogEntryItem(currentStart, currentEnd);
  //       followingDayEntry.note = timelogEntry.note;
  //       followingDayEntry.timelogEntryActivities = [activity];
  //       followingDayEntries.push(followingDayEntry);
  //     }else{
  //       console.log("WHAT THE FUCK")
  //     }

  //     currentStart = moment(currentEnd);

  //   })

  //   let sumSeconds: number = 0;
  //   // console.log("SPLIT ENTRIES:  " + timelogEntry.startTime.format("YYYY-MM-DD hh:mm a") + "  -  " + timelogEntry.endTime.format("YYYY-MM-DD hh:mm a"))
  //   sameDayEntries.forEach((entry) => {
  //     // console.log("    "+ entry.startTime.format("YYYY-MM-DD hh:mm a") + "  -  " + entry.endTime.format("YYYY-MM-DD hh:mm a"))
  //     sumSeconds += entry.endTime.diff(entry.startTime, "seconds");
  //     if(entry.timelogEntryActivities.length == 0){
  //       console.log("what the FUCKL", entry)
  //     }
  //   })
  //   followingDayEntries.forEach((entry) => {
  //     // console.log("    "+ entry.startTime.format("YYYY-MM-DD hh:mm a") + "  -  " + entry.endTime.format("YYYY-MM-DD hh:mm a"))
  //     sumSeconds += entry.endTime.diff(entry.startTime, "seconds");
  //     if(entry.timelogEntryActivities.length == 0){
  //       console.log("what the FUCKL", entry)
  //     }
  //   })

  //   if (Math.abs(sumSeconds - timelogEntry.durationSeconds ) > 3) {
  //     console.log("Error:  bad sum ", sumSeconds, timelogEntry.durationSeconds)
  //     console.log("SPLIT ENTRIES:  " + timelogEntry.startTime.format("YYYY-MM-DD hh:mm a") + "  -  " + timelogEntry.endTime.format("YYYY-MM-DD hh:mm a"))
  //     sameDayEntries.forEach((entry) => {
  //       console.log("    " + entry.startTime.format("YYYY-MM-DD hh:mm a") + "  -  " + entry.endTime.format("YYYY-MM-DD hh:mm a"))
  //       // sumSeconds += entry.endTime.diff(entry.startTime, "seconds");
  //     })
  //     followingDayEntries.forEach((entry) => {
  //       console.log("    " + entry.startTime.format("YYYY-MM-DD hh:mm a") + "  -  " + entry.endTime.format("YYYY-MM-DD hh:mm a"))
  //       // sumSeconds += entry.endTime.diff(entry.startTime, "seconds");
  //     })
  //   }






  //   return { sameDayEntries: sameDayEntries, followingDayEntries: followingDayEntries };


  // }


  // private buildTimelogEntryItemFromData(data: any): TimelogEntryItem {
  //   let startTime: moment.Moment = moment(data.startTimeISO);
  //   let endTime: moment.Moment = moment(data.endTimeISO);
  //   let timelogEntry: TimelogEntryItem = new TimelogEntryItem(startTime, endTime);
  //   timelogEntry.note = data.description;
  //   let newActivities: TimelogEntryActivity[] = [];
  //   for (let j = 0; j < data.itleActivities.length; j++) {
  //     let itleActivity: { durationMinutes: number, activityTreeId: string } = data.itleActivities[j];
  //     let percentage: number = ((itleActivity.durationMinutes * 60) / timelogEntry.durationSeconds) * 100;
  //     newActivities.push({
  //       percentage: percentage,
  //       activityTreeId: itleActivity.activityTreeId,
  //     });
  //   }
  //   timelogEntry.timelogEntryActivities = newActivities;
  //   return timelogEntry;
  // }




  // private validateDayItem(day: DaybookDayItem) : DaybookDayItem{
  //   let sumSeconds: number = 0;



  //   // for(let i=0; i<day.daybookTimelogEntryDataItems.length; i++){
  //   //   console.log("   - " + moment(day.daybookTimelogEntryDataItems[i].startTimeISO).format("YYYY-MM-DD hh:mm a") + " to " + moment(day.daybookTimelogEntryDataItems[i].endTimeISO).format("YYYY-MM-DD hh:mm a") )

  //   // }
  //   let newTimelogEntryDataItems = [];
  //   for (let i = 0; i < day.daybookTimelogEntryDataItems.length; i++) {

  //     let startTime: moment.Moment = moment(day.daybookTimelogEntryDataItems[i].startTimeISO);
  //     let endTime: moment.Moment = moment(day.daybookTimelogEntryDataItems[i].endTimeISO);
  //     let diffSeconds: number = moment(endTime).diff(startTime, "seconds");
  //     sumSeconds += diffSeconds;

  //     if(endTime.isBefore(startTime)){
  //       console.log("what the fuck");
  //     }
  //     if(startTime.isBefore(moment(day.dateYYYYMMDD).startOf("day"))){
  //       console.log("   startTime time ("+startTime.format("YYYY-MM-DD hh:mm a")+") is before start of day: " + moment(day.dateYYYYMMDD).startOf("day").format("YYYY-MM-DD hh:mm aa"))
  //     }
  //     if(endTime.isAfter(moment(day.dateYYYYMMDD).startOf("day").add(24, "hours"))){
  //       console.log("   end time ("+endTime.format("YYYY-MM-DD hh:mm a")+") is after end of day: " + moment(day.dateYYYYMMDD).startOf("day").add(24, "hours").format("YYYY-MM-DD hh:mm aa"))
  //     }




  //     let badIndexes: number[] = [];

      

      
  //     if(i < day.daybookTimelogEntryDataItems.length-1){
  //       if (endTime.isAfter(moment(day.daybookTimelogEntryDataItems[i+1].startTimeISO))){
          
  //         console.log("   we got a big time error: " + endTime.format("YYYY-MM-DD hh:mm a") + " is after " + moment(day.daybookTimelogEntryDataItems[i+1].startTimeISO).format("YYYY-MM-DD hh:mm a"),  day)

  //       }else{
  //         if(day.daybookTimelogEntryDataItems[i].timelogEntryActivities.length == 0){
  //           console.log("Excuse me, what the fuck")
  //         }else{
  //           newTimelogEntryDataItems.push(day.daybookTimelogEntryDataItems[i]);
  //         }
          
  //       }
  //     }  

      

  //   }

  //   day.daybookTimelogEntryDataItems = newTimelogEntryDataItems;
  //   return day;
  // }

}
