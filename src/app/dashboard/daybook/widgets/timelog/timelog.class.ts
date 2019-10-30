import { DaybookTimelogEntryDataItem } from "../../api/data-items/daybook-timelog-entry-data-item.interface";
import { DaybookDayItemSleepProfile } from "../../api/data-items/daybook-day-item-sleep-profile.interface";
import { TimelogZoomControl } from "./timelog-large/timelog-zoom-controller/timelog-zoom-control.interface";
import { TimelogEntryItem } from "./timelog-large/timelog-body/timelog-entry/timelog-entry-item.class";
import * as moment from 'moment';
import { DaybookDayItem } from "../../api/daybook-day-item.class";
import { TimeDelineator } from "./time-delineator.class";
import { faMoon, faSun, IconDefinition } from '@fortawesome/free-solid-svg-icons';

export class Timelog {

  constructor(timelogZoomControl: TimelogZoomControl, activeDay: DaybookDayItem, minutesPerTwentyPixels: number) {
    // console.log("timelog.class constructor()")
    this._timelogZoomControl = timelogZoomControl;
    this._activeDay = activeDay;
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
    this.update();
  }

  private _minutesPerTwentyPixels: number;
  private _timelogZoomControl: TimelogZoomControl;

  private _activeDay: DaybookDayItem;

  private getTotalViewSeconds(): number {
    return this._timelogZoomControl.endTime.diff(this._timelogZoomControl.startTime, "seconds");
  }
  private timeIsInView(time: moment.Moment): boolean {
    return time.isSameOrAfter(this._timelogZoomControl.startTime) && time.isSameOrBefore(this._timelogZoomControl.endTime);
  }

  public updateEntrySizes(minutesPerTwentyPixels: number) {
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
    // console.log("Minutes per 20 pixels (approx): ", this._minutesPerTwentyPixels);
    this._entryItems.forEach((entryItem) => {
      if (entryItem.durationSeconds < (this._minutesPerTwentyPixels * 60)) {
        entryItem.isSmallSize = true;
      } else {
        entryItem.isSmallSize = false;
      }
    });
  }

  private _entryItemsNgStyle: any = { "grid-template-rows": "1fr" };
  private _entryItems: TimelogEntryItem[] = [];

  public get entryItemsNgStyle(): any { return this._entryItemsNgStyle; }
  public get entryItems(): TimelogEntryItem[] { return this._entryItems; }

  private _timeDelineators: TimeDelineator[] = [];
  private _timeDelineatorsNgStyle: any = { "grid-template-rows": "1fr" };
  public get timeDelineators(): TimeDelineator[] { return this._timeDelineators; }
  public get timeDelineatorsNgStyle(): any { return this._timeDelineatorsNgStyle; };

  public addTimeDelineator(time: moment.Moment) {
    if (!this.crossesAnyTimelogEntry(time)) {
      this._activeDay.addTimeDelineator(time.toISOString())
      this.update();
    }
  }
  public removeTimeDelineator(delineator: TimeDelineator) {
    this._activeDay.removeTimeDelineator(delineator.time.toISOString());
    this.update();
  }

  private update() {
    this.updateTimeDelineators();
    this.updateTimelogEntryItems();
  }

  private updateTimeDelineators() {
    let allTimes: TimeDelineator[] = [];
    allTimes = this.addSleepTimeDelineators(allTimes);
    allTimes = this.addNowTimeDelineator(allTimes);

    for (let i = 0; i < this._activeDay.daybookTimelogEntryDataItems.length; i++) {
      /**
       * For each timelog entry: add 1 delineator for the start time and 1 delineator for the end time, 
       * unless if the end of one entry is the same as the start of the next entry, 
       * in which case it will be added for the start of the next entry.
       */
      const startTime: moment.Moment = moment(this._activeDay.daybookTimelogEntryDataItems[i].startTimeISO);
      const endTime: moment.Moment = moment(this._activeDay.daybookTimelogEntryDataItems[i].endTimeISO);

      let startDelineator: TimeDelineator = new TimeDelineator(startTime, "TIMELOG_ENTRY");
      startDelineator.nextDelineatorTime = endTime;
      let endDelineator: TimeDelineator;

      if (i < this._activeDay.daybookTimelogEntryDataItems.length - 1) {
        const nextStartTime: moment.Moment = moment(this._activeDay.daybookTimelogEntryDataItems[i + 1].startTimeISO);
        if (!nextStartTime.isSame(endTime)) {
          endDelineator = new TimeDelineator(endTime, "TIMELOG_ENTRY");
        }
      } else if (i === this._activeDay.daybookTimelogEntryDataItems.length - 1) {
        endDelineator = new TimeDelineator(endTime, "TIMELOG_ENTRY");
      }

      allTimes.push(startDelineator);
      if (endDelineator) {
        allTimes.push(endDelineator);
      }
    }

    allTimes = this.addExistingDelineators(allTimes);
    allTimes = this.setFollowingTimesOfDelineators(allTimes);
    allTimes = this.setVisibilityOfTimelogDelineators(allTimes);
    // allTimes.forEach((time) => {
    //   console.log("Delineators:  " + time.time.format("hh:mm a") + " isVisible?: ", time.isVisible , " type: ", time.delineatorType);
    // });

    if (allTimes.length > 0) {
      let gridTemplateRows: string = "";
      let percentages: number[] = [];
      let currentTime: moment.Moment = this._timelogZoomControl.startTime;
      for (let i = 0; i < allTimes.length; i++) {
        let seconds: number = allTimes[i].time.diff(currentTime, "seconds");
        percentages.push((seconds / this.getTotalViewSeconds()) * 100);
        currentTime = moment(allTimes[i].time);
      }
      let finalSeconds: number = this._timelogZoomControl.endTime.diff(currentTime, "seconds");
      percentages.push((finalSeconds / this.getTotalViewSeconds()) * 100);
      percentages.forEach((percentage: number) => {
        gridTemplateRows += "" + percentage.toFixed(2) + "% ";
      });
      this._timeDelineators = allTimes;
      this._timeDelineatorsNgStyle = { "grid-template-rows": gridTemplateRows };
    } else {
      this._timeDelineators = [];
      this._timeDelineatorsNgStyle = { "grid-template-rows": "1fr" };
    }


    /**
     * At the end of selecting, then check the very first and very last delineator if within 30 minutes, and make visible if not.
     */

  }

  private setVisibilityOfTimelogDelineators(allTimes: TimeDelineator[]): TimeDelineator[] {
    let timelogEntryDelineators: TimeDelineator[] = allTimes.filter((time) => { return time.delineatorType === "TIMELOG_ENTRY"; })
      .sort((delineator1, delineator2) => {
        if (delineator1.durationSeconds > delineator2.durationSeconds) return -1;
        else if (delineator1.durationSeconds < delineator2.durationSeconds) return 1;
        else return 0;
      });
    let sleepTimes: moment.Moment[] = allTimes.filter((time) => { return time.delineatorType === "SLEEP"; }).map((delineator) => { return delineator.time });
    timelogEntryDelineators.forEach((entryDelineator) => {
      if (!this.isWithin30MinutesOfAnother(entryDelineator, allTimes)) entryDelineator.isVisible = true;
      else entryDelineator.isVisible = false;
      sleepTimes.forEach((sleepTime) => {
        if (entryDelineator.time.isSame(sleepTime)) {
          entryDelineator.isVisible = false;
        }
      })
    });

    allTimes.filter((time) => { return time.delineatorType === "NOW" }).forEach((nowTime) => { nowTime.isVisible = false; });
    // allTimes[allTimes.length - 1].isVisible = true;
    return allTimes;
  }

  private setFollowingTimesOfDelineators(allTimes: TimeDelineator[]): TimeDelineator[] {
    allTimes = this.filterAndSortDelineators(allTimes);
    for (let i = 0; i < allTimes.length - 1; i++) {
      if (allTimes[i].nextDelineatorTime === null) {
        allTimes[i].nextDelineatorTime = moment(allTimes[i + 1].time);
      }
    }
    return allTimes;
  }

  private addExistingDelineators(allTimes: TimeDelineator[]): TimeDelineator[] {
    this._activeDay.timeDelineators.forEach((time: string) => {
      if (!this.crossesAnyTimelogEntry(moment(time))) {
        let delineator: TimeDelineator = new TimeDelineator(moment(time), "DELINEATOR");
        delineator.isVisible = true;
        allTimes.push(delineator);
      }
    });
    return allTimes;
  }


  public showNowTime(): boolean {
    let nowDelineator: TimeDelineator = this._timeDelineators.filter((delineator) => { return delineator.delineatorType === "NOW"; })[0];
    if(!nowDelineator){
      nowDelineator = new TimeDelineator(moment(), "NOW");
    }
    return !this.isWithin30MinutesOfAnother(nowDelineator);
  }

  private isWithin30MinutesOfAnother(checkDelineator: TimeDelineator, currentDelineators?: TimeDelineator[]): boolean {
    let delineators: TimeDelineator[] = []
    if (!currentDelineators) delineators = this._timeDelineators;
    else delineators = currentDelineators;

    delineators = delineators.filter((delineator) => { return delineator.isVisible; });

    let isWithin30Minutes: boolean = false;
    if (checkDelineator.delineatorType === "NOW") {
      delineators.forEach((delineator) => {
        const differenceMinutes: number = Math.abs(moment(delineator.time).diff(moment(checkDelineator.time), "minutes"));
        if (differenceMinutes < 30) {
          isWithin30Minutes = true;
        }
      });
    } else {
      delineators.forEach((delineator) => {
        const isSameTime: boolean = moment(delineator.time).isSame(moment(checkDelineator.time));
        const differenceMinutes: number = Math.abs(moment(delineator.time).diff(moment(checkDelineator.time), "minutes"));
        if (differenceMinutes < 30 && !isSameTime) {
          isWithin30Minutes = true;
        }
      });
    }
    return isWithin30Minutes;
  }

  public crossesAnyTimelogEntry(time: moment.Moment): boolean {
    let crossesExisting: boolean = false;
    this._activeDay.daybookTimelogEntryDataItems.forEach((entryDataItem) => {
      const start: moment.Moment = moment(entryDataItem.startTimeISO);
      const end: moment.Moment = moment(entryDataItem.endTimeISO);
      if (time.isSameOrAfter(start) && time.isSameOrBefore(end)) {
        crossesExisting = true;
      }
    });
    return crossesExisting;
  }


  private filterAndSortDelineators(delineators: TimeDelineator[]): TimeDelineator[] {
    return delineators.filter((delineator) => {
      return this.timeIsInView(delineator.time);
    }).sort((delineator1, delineator2) => {
      if (delineator1.time.isBefore(delineator2.time)) return -1;
      else if (delineator1.time.isAfter(delineator2.time)) return 1;
      else return 0;
    });
  }

  private addNowTimeDelineator(delineations: TimeDelineator[]): TimeDelineator[] {
    const now: moment.Moment = moment();
    if (this.timeIsInView(now)) {
      let nowDelineator: TimeDelineator = new TimeDelineator(now, "NOW");
      if (!this.crossesAnyTimelogEntry(now)) {
        delineations.push(nowDelineator);
      }
    }
    return delineations;
  }

  private addSleepTimeDelineators(delineations: TimeDelineator[]): TimeDelineator[] {
    let wakeupDelineator: TimeDelineator;
    let bedtimeDelineator: TimeDelineator;

    if(this._activeDay.wakeupTimeIsSet){
      if (this.timeIsInView(moment(this._activeDay.sleepProfile.wakeupTimeISO))) {
        wakeupDelineator = new TimeDelineator(moment(this._activeDay.sleepProfile.wakeupTimeISO), "SLEEP", faSun, "rgb(235, 201, 12)");
      }
    }else{
      if (this.timeIsInView(this._activeDay.wakeupTime)) {
        wakeupDelineator = new TimeDelineator(this._activeDay.wakeupTime, "SLEEP", faSun, "rgb(200, 200, 200)");
      }
    }

    if(this._activeDay.bedTimeIsSet){
      if (this.timeIsInView(moment(this._activeDay.sleepProfile.bedtimeISO))) {
        bedtimeDelineator = new TimeDelineator(moment(this._activeDay.sleepProfile.bedtimeISO), "SLEEP", faMoon, "rgb(68, 0, 255)");
      }
    }else{
      if (this.timeIsInView(this._activeDay.bedtime)) {
        bedtimeDelineator = new TimeDelineator(this._activeDay.bedtime, "SLEEP", faMoon, "rgb(200, 200, 200)");
      }
    }

    if (wakeupDelineator) {
      wakeupDelineator.isVisible = true;
      wakeupDelineator.label = "wake up"
      delineations.push(wakeupDelineator);
    }
    if (bedtimeDelineator) {
      bedtimeDelineator.isVisible = true;
      bedtimeDelineator.label = "bed time";
      delineations.push(bedtimeDelineator);
    }
    return delineations;
  }

  private updateTimelogEntryItems() {
    const totalViewSeconds: number = this._timelogZoomControl.endTime.diff(this._timelogZoomControl.startTime, "seconds");
    let delineators: TimeDelineator[] = Object.assign([], this._timeDelineators);
    delineators.push(new TimeDelineator(moment(this._timelogZoomControl.startTime), "FRAME"));
    delineators.push(new TimeDelineator(moment(this._timelogZoomControl.endTime), "FRAME"));
    delineators = this.filterAndSortDelineators(delineators);

    const entriesCount: number = delineators.length - 1;
    let entries: TimelogEntryItem[] = [];
    const wakeupTime: moment.Moment = this._activeDay.wakeupTime;
    const bedTime: moment.Moment = this._activeDay.bedtime;

    for (let i = 0; i < entriesCount; i++) {
      const startTime: moment.Moment = delineators[i].time;
      const endTime: moment.Moment = delineators[i + 1].time;
      if(!moment(startTime).isSame(moment(endTime))){
        /* 
          there was a problem where there would be a duplicate delineator at the wakeup time, e.g. 8:30am,
          a delineator for the wakeup and a delineator for the start of a timelog entry for that day.
          so this if statement catches the case where the start and end time are the same 
          (sorted array would have i and i+1 have same value );
        */
        let sleepState: "AWAKE" | "SLEEP" = "AWAKE";
        if (endTime.isSameOrBefore(wakeupTime) || startTime.isSameOrAfter(bedTime)) {
          sleepState = "SLEEP";
        }
        const entry: TimelogEntryItem = new TimelogEntryItem(startTime, endTime, sleepState);
        entries.push(entry);
      }
    }


    this._activeDay.daybookTimelogEntryDataItems.forEach((entryDataItem) => {
      const entryDataStartTime: moment.Moment = moment(entryDataItem.startTimeISO);
      const entryDataEndTime: moment.Moment = moment(entryDataItem.endTimeISO);
      entries.forEach((entry) => {
        if (entry.startTime.isSame(entryDataStartTime) && entry.endTime.isSame(entryDataEndTime)) {
          entry.note = entryDataItem.note;
          entry.timelogEntryActivities = entryDataItem.timelogEntryActivities;
          entry.isSavedEntry = true;
        }
      });
    });


    entries = entries.sort((entry1, entry2) => {
      if (entry1.startTime.isBefore(entry2.startTime)) return -1
      else if (entry2.startTime.isBefore(entry1.startTime)) return 1
      else return 0;
    });

    let gridTemplateRows: string = "";
    entries.forEach(item => {
      // console.log("percent la: ", item.percentOfTotal(totalViewSeconds).toFixed(2))
      gridTemplateRows += "" + item.percentOfTotal(totalViewSeconds).toFixed(2) + "% ";
      if (item.durationSeconds < (this._minutesPerTwentyPixels * 60)) {
        item.isSmallSize = true;
      } else {
        item.isSmallSize = false;
      }
    });

    // console.log("Timelog Entry items grid-template-rows:", gridTemplateRows)
    this._entryItemsNgStyle = { "grid-template-rows": gridTemplateRows };
    this._entryItems = entries;
  }



  faMoon = faMoon;
  faSun = faSun;
}