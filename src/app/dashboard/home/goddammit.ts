
//   private splitSleepTLE(sleepTLE: TimelogEntryItem): { prev: TimelogEntryItem, sleep: TimelogEntryItem, following: TimelogEntryItem } {


//     let sleepActivityIndex: number = -1;
//     sleepTLE.timelogEntryActivities.forEach((tleActivity) => {
//       let activity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(tleActivity.activityTreeId);
//       if (activity.isSleepActivity) {
//         sleepActivityIndex = sleepTLE.timelogEntryActivities.indexOf(tleActivity);
//       }
//     });


//     let priorActivities: TimelogEntryActivity[] = [];
//     let followingActivities: TimelogEntryActivity[] = [];
//     let sleepActivity: TimelogEntryActivity;

//     for (let i = 0; i < sleepTLE.timelogEntryActivities.length; i++) {
//       if (i < sleepActivityIndex) {
//         priorActivities.push(sleepTLE.timelogEntryActivities[i])
//       } else if (i == sleepActivityIndex) {
//         sleepActivity = sleepTLE.timelogEntryActivities[i];
//       } else if (i > sleepActivityIndex) {
//         followingActivities.push(sleepTLE.timelogEntryActivities[i])
//       }
//     }

//     let precedingTimelogEntry: TimelogEntryItem;
//     let sleepTimelogEntry: TimelogEntryItem;
//     let followingTimelogEntry: TimelogEntryItem;


//     if (priorActivities.length > 0) {
//       let startTime: moment.Moment = moment(sleepTLE.startTime);

//       let sumOfSeconds: number;
//       priorActivities.forEach((item) => {
//         sumOfSeconds += ((item.percentage / 100) * sleepTLE.durationSeconds);
//       });

//       let endTime: moment.Moment = moment(startTime).add(sumOfSeconds, "seconds");

//       precedingTimelogEntry = new TimelogEntryItem(startTime, endTime);
//       precedingTimelogEntry.note = sleepTLE.note;
//       precedingTimelogEntry.timelogEntryActivities = priorActivities;



//     }

//     if (sleepActivity) {
//       let startTime: moment.Moment = moment(sleepTLE.startTime);
//       let endTime: moment.Moment = moment(sleepTLE.endTime);
//       if (precedingTimelogEntry) {
//         startTime = precedingTimelogEntry.endTime
//       }
//       sleepTimelogEntry = new TimelogEntryItem(startTime, endTime);
//       sleepTimelogEntry.note = sleepTLE.note;
//       sleepTimelogEntry.timelogEntryActivities = [sleepActivity];
//     } else {
//       console.log(" Big error");
//     }

//     if (followingActivities.length > 0) {


//       let sumOfSeconds: number;
//       priorActivities.forEach((item) => {
//         sumOfSeconds += ((item.percentage / 100) * sleepTLE.durationSeconds);
//       });

//       let startTime: moment.Moment = moment(sleepTLE.endTime).subtract(sumOfSeconds, "seconds");
//       let endTime: moment.Moment = moment(sleepTLE.endTime);

//       sleepTimelogEntry.endTime = startTime;

//       followingTimelogEntry = new TimelogEntryItem(startTime, endTime);
//       followingTimelogEntry.note = sleepTLE.note;
//       followingTimelogEntry.timelogEntryActivities = priorActivities;

//     }

//     return {
//       prev: precedingTimelogEntry,
//       sleep: sleepTimelogEntry,
//       following: followingTimelogEntry,
//     }

//   }

//   private buildSleepProfile(daybookDayItem: DaybookDayItem, sleepTLE: TimelogEntryItem): DaybookDayItemSleepProfile {


//     let currentDateYYYYMMDD: string = moment(sleepTLE.startTime).format("YYYY-MM-DD");
//     let followingDateYYYYMMDD: string = moment(sleepTLE.endTime).format("YYYY-MM-DD");

//     let isSameDate: boolean = currentDateYYYYMMDD == followingDateYYYYMMDD;
//     let datesFollow: boolean = moment(currentDateYYYYMMDD).isBefore(moment(followingDateYYYYMMDD));


//     // console.log("currentdate, following date:", currentDateYYYYMMDD, followingDateYYYYMMDD)

//     if (moment(currentDateYYYYMMDD).isSame(moment(daybookDayItem.dateYYYYMMDD))) {
//       if (isSameDate) {
//         // TLE starts and ends within the same date
//       } else if (datesFollow) {
//         // tle starts in the date and then ends into the new date (after midnight)
//       } else {
//         console.log("wtf")
//       }
//     } else if (moment(currentDateYYYYMMDD).isAfter(moment(daybookDayItem.dateYYYYMMDD))) {
//       if (isSameDate) {
//         // the tle starts after the date and ends after the date.  fully after.
//       } else if (datesFollow) {
//         console.log("????????")
//         console.log(moment(daybookDayItem.dateYYYYMMDD).format("YYYY-MM-DD"), moment(currentDateYYYYMMDD).format("YYYY-MM-DD"), moment(followingDateYYYYMMDD).format("YYYY-MM-DD"))
//       } else {
//         console.log("wtf")
//       }
//     } else if (moment(currentDateYYYYMMDD).isBefore(daybookDayItem.dateYYYYMMDD)) {
//       if (isSameDate) {
//         // the TLE is fully before the DaybookDayItem.date
//       } else if (datesFollow) {
//         // the TLE starts before the date and ends Into the date
//       } else {
//         console.log("wtf")
//       }

//     } else {
//       console.log("yuge error");
//     }

//     // sleepProfile = {
//     //   sleepQuality: SleepQuality,

//     //   previousFallAsleepTimeISO: string,
//     //   previousFallAsleepTimeUtcOffsetMinutes: number,

//     //   wakeupTimeISO: string,
//     //   wakeupTimeUtcOffsetMinutes: number,

//     //   bedtimeISO: string,
//     //   bedtimeUtcOffsetMinutes: number,

//     //   fallAsleepTimeISO: string,
//     //   fallAsleepTimeUtcOffsetMinutes: number,

//     //   estimatedSleepDurationMinutes: number,
//     // }
//     // console.log("Sleep timelog entry: " + sleepTLE.startTime.format("YYYY-MM-DD hh:mm a") + " to " + sleepTLE.endTime.format("YYYY-MM-DD hh:mm a"));

//     return

//   }
//   private crossesMidnight(timelogEntry: TimelogEntryItem): boolean {
//     const midnight: moment.Moment = moment(timelogEntry.startTime).startOf("day").add(24, "hours");
//     const startsBefore: boolean = timelogEntry.startTime.isSameOrBefore(midnight);
//     const endsAfter: boolean = timelogEntry.endTime.isSameOrAfter(midnight);

//     if (startsBefore && endsAfter) {
//       return true;
//     } else {
//       return false;
//     }
//   }

//   private isFullyInDay(timelogEntry: TimelogEntryItem): boolean {
//     const isAfterStart: boolean = timelogEntry.startTime.isSameOrAfter(moment(timelogEntry.startTime).startOf("day"));
//     const isBeforeEnd: boolean = timelogEntry.endTime.isSameOrBefore(moment(timelogEntry.startTime).endOf("day"));

//     if (isAfterStart && isBeforeEnd) {
//       return true;
//     } else {
//       return false;
//     }
//   }

//   private buildTimelogEntryItemFromData(data: any): TimelogEntryItem {
//     let startTime: moment.Moment = moment(data.startTimeISO);
//     let endTime: moment.Moment = moment(data.endTimeISO);
//     let timelogEntry: TimelogEntryItem = new TimelogEntryItem(startTime, endTime);
//     timelogEntry.note = data.description;
//     let newActivities: TimelogEntryActivity[] = [];
//     for (let j = 0; j < data.itleActivities.length; j++) {
//       let itleActivity: { durationMinutes: number, activityTreeId: string } = data.itleActivities[j];
//       let percentage: number = ((itleActivity.durationMinutes * 60) / timelogEntry.durationSeconds) * 100;
//       newActivities.push({
//         percentage: percentage,
//         activityTreeId: itleActivity.activityTreeId,
//       });
//     }
//     timelogEntry.timelogEntryActivities = newActivities;
//     return timelogEntry;
//   }

//   private crossMidnight(currentDaybookDayItem: DaybookDayItem, thing: { beforeMidnightEntries: TimelogEntryItem[], sleep: TimelogEntryItem, afterMidnightEntries: TimelogEntryItem[] }): { current: DaybookDayItem, next: DaybookDayItem } {

//     let currentDateYYYYMMDD = currentDaybookDayItem.dateYYYYMMDD;
//     let followingDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, "day").format("YYYY-MM-DD");
//     let newDaybookDayItem: DaybookDayItem = new DaybookDayItem(followingDateYYYYMMDD);

//     thing.beforeMidnightEntries.forEach((entry) => {
//       currentDaybookDayItem.addTimelogEntryItem(entry.dataEntryItem);
//     });

//     thing.afterMidnightEntries.forEach((entry) => {
//       newDaybookDayItem.addTimelogEntryItem(entry.dataEntryItem);
//     });

//     if (thing.sleep) {
//       // console.log("Thing.sleep: " + thing.sleep.startTime.format("YYYY-MM-DD"))
//       currentDaybookDayItem.sleepProfile = this.buildSleepProfile(currentDaybookDayItem, thing.sleep);
//       newDaybookDayItem.sleepProfile = this.buildSleepProfile(newDaybookDayItem, thing.sleep);
//     }


//     return {
//       current: currentDaybookDayItem,
//       next: newDaybookDayItem
//     }
//   }



//   private splitAcrossMidnight(timelogEntry: TimelogEntryItem): { beforeMidnightEntries: TimelogEntryItem[], sleep: TimelogEntryItem, afterMidnightEntries: TimelogEntryItem[] } {
//     let sleepActivityIndex: number = -1;
//     timelogEntry.timelogEntryActivities.forEach((tleActivity) => {
//       let activity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(tleActivity.activityTreeId);
//       if (activity.isSleepActivity) {
//         sleepActivityIndex = timelogEntry.timelogEntryActivities.indexOf(tleActivity);
//       }
//     });




//     let priorActivities: TimelogEntryActivity[] = [];
//     let followingActivities: TimelogEntryActivity[] = [];
//     let sleepActivity: TimelogEntryActivity;

//     for (let i = 0; i < timelogEntry.timelogEntryActivities.length; i++) {
//       if (i < sleepActivityIndex) {
//         priorActivities.push(timelogEntry.timelogEntryActivities[i])
//       } else if (i == sleepActivityIndex) {
//         sleepActivity = timelogEntry.timelogEntryActivities[i];
//       } else if (i > sleepActivityIndex) {
//         followingActivities.push(timelogEntry.timelogEntryActivities[i])
//       }
//     }

//     let precedingTimelogEntry: TimelogEntryItem;
//     let followingTimelogEntry: TimelogEntryItem;

//     let beforeMidnightEntries: TimelogEntryItem[] = [];
//     let sleepTimelogEntry: TimelogEntryItem;
//     let afterMidnightEntries: TimelogEntryItem[] = [];

//     let totalDurationSeconds: number = timelogEntry.durationSeconds;

//     if (priorActivities.length > 0) {
//       precedingTimelogEntry = new TimelogEntryItem(timelogEntry.startTime, timelogEntry.endTime);
//       precedingTimelogEntry.note = timelogEntry.note;
//       precedingTimelogEntry.timelogEntryActivities = priorActivities;
//       let durationSeconds: number = 0;
//       priorActivities.forEach((item) => {
//         durationSeconds += ((item.percentage / 100) * totalDurationSeconds);
//       });
//       precedingTimelogEntry.endTime = moment(precedingTimelogEntry.startTime).add(durationSeconds, "seconds");

//     }

//     if (followingActivities) {
//       followingTimelogEntry = new TimelogEntryItem(timelogEntry.startTime, timelogEntry.endTime);
//       followingTimelogEntry.note = timelogEntry.note;
//       followingTimelogEntry.timelogEntryActivities = followingActivities;
//       let durationSeconds: number = 0;
//       followingActivities.forEach((item) => {
//         durationSeconds += ((item.percentage / 100) * totalDurationSeconds);
//       });
//       followingTimelogEntry.startTime = moment(followingTimelogEntry.endTime).subtract(durationSeconds, "seconds");
//     }

//     if (!sleepActivity) {

//     } else {
//       let sleepStartTime: moment.Moment;
//       let sleepEndTime: moment.Moment;
//       if (precedingTimelogEntry) {
//         sleepStartTime = moment(precedingTimelogEntry.endTime);
//       } else {
//         sleepStartTime = moment(timelogEntry.startTime);
//       }
//       if (followingTimelogEntry) {
//         sleepEndTime = moment(followingTimelogEntry.startTime)
//       } else {
//         sleepEndTime = moment(timelogEntry.endTime);
//       }
//       sleepTimelogEntry = new TimelogEntryItem(sleepStartTime, sleepEndTime);
//       sleepTimelogEntry.note = timelogEntry.note;
//       sleepTimelogEntry.timelogEntryActivities = [
//         {
//           activityTreeId: sleepActivity.activityTreeId,
//           percentage: 100
//         }
//       ]
//     }


//     if (precedingTimelogEntry) {
//       if (this.crossesMidnight(precedingTimelogEntry)) {
//         let start: moment.Moment = precedingTimelogEntry.startTime;
//         let midnight: moment.Moment = moment(precedingTimelogEntry.startTime).startOf("day").add(24, "hours");
//         let end: moment.Moment = precedingTimelogEntry.endTime;

//         let beforeMidnightEntry: TimelogEntryItem = new TimelogEntryItem(start, midnight);
//         beforeMidnightEntry.note = precedingTimelogEntry.note;
//         beforeMidnightEntry.timelogEntryActivities = precedingTimelogEntry.timelogEntryActivities;

//         beforeMidnightEntries.push(beforeMidnightEntry);

//         let afterMidnightEntry: TimelogEntryItem = new TimelogEntryItem(midnight, end);
//         afterMidnightEntry.note = precedingTimelogEntry.note;
//         afterMidnightEntry.timelogEntryActivities = precedingTimelogEntry.timelogEntryActivities;

//         afterMidnightEntries.push(afterMidnightEntry);
//       } else if (this.isFullyInDay(precedingTimelogEntry)) {
//         beforeMidnightEntries.push(precedingTimelogEntry);
//       }
//     }


//     if (followingTimelogEntry) {
//       if (this.crossesMidnight(followingTimelogEntry)) {
//         let start: moment.Moment = followingTimelogEntry.startTime;
//         let midnight: moment.Moment = moment(followingTimelogEntry.startTime).startOf("day").add(24, "hours");
//         let end: moment.Moment = followingTimelogEntry.endTime;

//         let beforeMidnightEntry: TimelogEntryItem = new TimelogEntryItem(start, midnight);
//         beforeMidnightEntry.note = followingTimelogEntry.note;
//         beforeMidnightEntry.timelogEntryActivities = followingTimelogEntry.timelogEntryActivities;

//         beforeMidnightEntries.push(beforeMidnightEntry);

//         let afterMidnightEntry: TimelogEntryItem = new TimelogEntryItem(midnight, end);
//         afterMidnightEntry.note = followingTimelogEntry.note;
//         afterMidnightEntry.timelogEntryActivities = followingTimelogEntry.timelogEntryActivities;

//         afterMidnightEntries.push(afterMidnightEntry);
//       } else if (this.isFullyInDay(followingTimelogEntry)) {
//         beforeMidnightEntries.push(followingTimelogEntry);
//       }
//     }


//     console.log("  TimelogEntry " + timelogEntry.startTime.format("YYYY-MM-DD hh:mm a"));
//     let midnight: moment.Moment = moment(timelogEntry.startTime).startOf("day").add(1, "days")
//     console.log("  Midnight is " + midnight.format("YYYY-MM-DD hh:mm a"));
//     beforeMidnightEntries.forEach((item)=>{
//       console.log("* before midnight: " + item.startTime.format("YYYY-MM-DD hh:mm a") + item.endTime.format("YYYY-MM-DD hh:mm a"))
//     })
//     // console.log("* sleep item: " + sleepTimelogEntry.startTime.format("YYYY-MM-DD hh:mm a"), sleepTimelogEntry);
//     afterMidnightEntries.forEach((item)=>{
//       console.log("* after midnight: " + item.startTime.format("YYYY-MM-DD hh:mm a") + item.endTime.format("YYYY-MM-DD hh:mm a"))
//     })


//     return {
//       beforeMidnightEntries: beforeMidnightEntries,
//       sleep: sleepTimelogEntry,
//       afterMidnightEntries: afterMidnightEntries,
//     };
//   }

//   private matchesSleepPattern(timelogEntry: TimelogEntryItem): boolean {
//     let matchesSleepPattern: boolean = true;
//     let sleepActivityIndex: number = -1;
//     timelogEntry.timelogEntryActivities.forEach((tleActivity) => {
//       let activity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(tleActivity.activityTreeId);
//       if (activity.isSleepActivity) {
//         sleepActivityIndex = timelogEntry.timelogEntryActivities.indexOf(tleActivity);
//       }
//     });
//     if (sleepActivityIndex > -1) {
//       matchesSleepPattern = true;
//     } else {
//       matchesSleepPattern = false;
//     }
//     return matchesSleepPattern;
//   }
