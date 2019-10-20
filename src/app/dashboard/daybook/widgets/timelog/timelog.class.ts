import { DaybookTimelogEntryDataItem } from "../../api/data-items/daybook-timelog-entry-data-item.interface";
import { DaybookDayItemSleepProfile } from "../../api/data-items/daybook-day-item-sleep-profile.interface";
import { TimelogZoomControl } from "./timelog-large/timelog-zoom-controller/timelog-zoom-control.interface";
import { TimelogEntryItem } from "./timelog-large/timelog-body/timelog-entry/timelog-entry-item.class";
import * as moment from 'moment';
import { DaybookDayItem } from "../../api/daybook-day-item.class";
import { TimeDelineator } from "./time-delineator.class";
import { faMoon, faSun, IconDefinition } from '@fortawesome/free-solid-svg-icons';

export class Timelog {

  constructor(timelogZoomControl: TimelogZoomControl, activeDay: DaybookDayItem) {
    console.log("Constructor is constructing")
    this._timelogZoomControl = timelogZoomControl;

    this._activeDay = activeDay;
    this.update();
  }

  private _timelogZoomControl: TimelogZoomControl;

  private _activeDay: DaybookDayItem;

  private getTotalViewSeconds(): number {
    return this._timelogZoomControl.endTime.diff(this._timelogZoomControl.startTime, "seconds");
  }
  private timeIsInView(time: moment.Moment): boolean {
    return time.isSameOrAfter(this._timelogZoomControl.startTime) && time.isSameOrBefore(this._timelogZoomControl.endTime);
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
    this._activeDay.addTimeDelineator(time.toISOString())
    this.update();
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
    allTimes[allTimes.length - 1].isVisible = true;

    allTimes = this.setVisibilityOfTimelogDelineators(allTimes);
    allTimes.forEach((time) => {
      console.log("Delineators:  " + time.time.format("hh:mm a") + " isVisible?: ", time.isVisible);
    });




    allTimes = this.filterAndSortDelineators(allTimes);

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

    // this._timeDelineators.forEach((time) => {
    //   console.log("Delineators:  " + time.time.format("hh:mm a") + " isVisible?: ", time.isVisible);
    // });

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
    timelogEntryDelineators.forEach((entryDelineator) => {
      if (!this.isWithin30MinutesOfAnother(entryDelineator, allTimes)) entryDelineator.isVisible = true;
      else entryDelineator.isVisible = false;
    });
    return allTimes;
  }


  private isWithin30MinutesOfAnother(checkDelineator: TimeDelineator, allDelineators: TimeDelineator[]): boolean {

    let isWithin30Minutes: boolean = false;
    allDelineators.forEach((delineator) => {
      const isSameTime: boolean = moment(delineator.time).isSame(moment(checkDelineator.time));
      const differenceMinutes: number = Math.abs(moment(delineator.time).diff(moment(checkDelineator.time), "minutes"));
      if (differenceMinutes < 30 && !isSameTime && delineator.isVisible === true) {
        isWithin30Minutes = true;
      }
    });
    return isWithin30Minutes;
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
      let crossesExisting: boolean = false;
      this._activeDay.daybookTimelogEntryDataItems.forEach((entryDataItem)=>{
        const start: moment.Moment = moment(entryDataItem.startTimeISO);
        const end: moment.Moment = moment(entryDataItem.endTimeISO);
        if(now.isSameOrAfter(start) && now.isSameOrBefore(end)){
          crossesExisting = true;
        }
      });
      if(!crossesExisting){
        delineations.push(nowDelineator);
      }
    }
    return delineations;
  }

  private addSleepTimeDelineators(delineations: TimeDelineator[]): TimeDelineator[] {
    let wakeupDelineator: TimeDelineator;
    let bedtimeDelineator: TimeDelineator;
    if (this._activeDay.sleepProfileIsSet) {
      if (this.timeIsInView(moment(this._activeDay.sleepProfile.wakeupTimeISO))) {
        wakeupDelineator = new TimeDelineator(moment(this._activeDay.sleepProfile.wakeupTimeISO), "SLEEP", faSun, "rgb(235, 201, 12)");
      }
      if (this.timeIsInView(moment(this._activeDay.sleepProfile.bedtimeISO))) {
        bedtimeDelineator = new TimeDelineator(moment(this._activeDay.sleepProfile.bedtimeISO), "SLEEP", faMoon, "rgb(68, 0, 255)");
      }
    } else {
      if (this.timeIsInView(this._activeDay.wakeupTime)) {
        wakeupDelineator = new TimeDelineator(this._activeDay.wakeupTime, "SLEEP", faSun, "rgb(200, 200, 200)");
      }
      if (this.timeIsInView(this._activeDay.bedtime)) {
        bedtimeDelineator = new TimeDelineator(this._activeDay.bedtime, "SLEEP", faMoon, "rgb(200, 200, 200)");
      }
    }
    if(wakeupDelineator){
      wakeupDelineator.isVisible = true;
      delineations.push(wakeupDelineator);
    }
    if(bedtimeDelineator){
      bedtimeDelineator.isVisible = true;
      delineations.push(bedtimeDelineator);
    }
    return delineations;
  }

  private updateTimelogEntryItems() {
    // let calculatedEntryItems: { startTime: moment.Moment, totalSeconds: number, percentOfTotal: number, item: TimelogEntryItem }[] = [];
    let totalViewSeconds: number = this._timelogZoomControl.endTime.diff(this._timelogZoomControl.startTime, "seconds");


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
      let sleepState: "AWAKE" | "SLEEP" = "AWAKE";
      if (endTime.isBefore(wakeupTime) || startTime.isAfter(bedTime)) {
        sleepState = "SLEEP";
      }
      const entry: TimelogEntryItem = new TimelogEntryItem(startTime, endTime, sleepState);
      entries.push(entry);
    }

    this._activeDay.daybookTimelogEntryDataItems.forEach((entryDataItem)=>{
      const entryDataStartTime: moment.Moment = moment(entryDataItem.startTimeISO);
      const entryDataEndTime: moment.Moment = moment(entryDataItem.endTimeISO);
      entries.forEach((entry)=>{
        if(entry.startTime.isSame(entryDataStartTime) && entry.endTime.isSame(entryDataEndTime)){
          console.log("we got a live one")
          entry.isSavedEntry = true;
        }
      });
    });


    entries = entries.sort((entry1, entry2) => {
      if (entry1.startTime.isBefore(entry2.startTime)) return -1
      else if (entry2.startTime.isBefore(entry1.startTime)) return 1
      else return 0;
    })

    let gridTemplateRows: string = "";
    entries.forEach(item => {
      // console.log("percent la: ", item.percentOfTotal(totalViewSeconds).toFixed(2))
      gridTemplateRows += "" + item.percentOfTotal(totalViewSeconds).toFixed(2) + "% ";
    });
    console.log("Timelog Entry items grid-template-rows:", gridTemplateRows)
    // console.log("Setting the STYLEY")
    this._entryItemsNgStyle = { "grid-template-rows": gridTemplateRows };
    this._entryItems = entries;
  }



  faMoon = faMoon;
  faSun = faSun;
}