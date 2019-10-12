import { DaybookTimelogEntryDataItem } from "../../api/data-items/daybook-timelog-entry-data-item.interface";
import { DaybookDayItemSleepProfile } from "../../api/data-items/daybook-day-item-sleep-profile.interface";
import { TimelogZoomControl } from "./timelog-large/timelog-zoom-controller/timelog-zoom-control.interface";
import { TimelogEntryItem } from "./timelog-large/timelog-body/timelog-entry/timelog-entry-item.class";
import * as moment from 'moment';
import { DaybookDayItem } from "../../api/daybook-day-item.class";

export class Timelog {

  constructor(timelogZoomControl: TimelogZoomControl, currentTime: moment.Moment, activeDay: DaybookDayItem) {
    console.log("Constructor is constructing")
    this._timelogZoomControl = timelogZoomControl;
    this._currentTime = currentTime;
    this._activeDay = activeDay;
    this.buildTimelog()
  }

  private _timelogZoomControl: TimelogZoomControl;
  private _currentTime: moment.Moment;
  private _activeDay: DaybookDayItem;

  

  private buildTimelog() {
    let calculatedEntryItems: { startTime: moment.Moment, totalSeconds: number, percentOfTotal: number, item: TimelogEntryItem}[] = [];
    let totalViewSeconds: number = this._timelogZoomControl.endTime.diff(this._timelogZoomControl.startTime, "seconds");
    if(this._activeDay.sleepProfileIsSet){
      if (this.viewStartsAfterWakeup()) {
        // 
        console.log("View starts after wakeup")
  
        /*
            startTimeISO: string;
            endTimeISO: string;
            utcOffsetMinutes: number;
            timelogEntryActivities: TimelogEntryActivity[];
            isConfirmed: boolean;
            note: string;    
        */
        let currentTime: moment.Moment = moment(this._timelogZoomControl.startTime);
        let wakeupTime: moment.Moment = moment(this._activeDay.sleepProfile.wakeupTimeISO);
        let bedTime: moment.Moment = moment(this._activeDay.sleepProfile.bedtimeISO);
  
        let startSleepItem = new TimelogEntryItem(currentTime, wakeupTime);
  
  
        calculatedEntryItems.push({
          startTime: currentTime,
          totalSeconds: wakeupTime.diff(currentTime, "seconds"),
          percentOfTotal: (startSleepItem.durationSeconds / totalViewSeconds) * 100,
          item: startSleepItem,
        });
  
        currentTime = moment(wakeupTime);
        let previousTimeMark: moment.Moment = moment(currentTime);
  
        if(this._activeDay.daybookTimelogEntryDataItems.length > 0){
  
        }else{
          currentTime = moment(bedTime);

          let gapEntryItem: TimelogEntryItem = new TimelogEntryItem(previousTimeMark, currentTime);
          let gapItem: any = {
            startTime: currentTime,
            totalSeconds: gapEntryItem.durationSeconds,
            percentOfTotal: (gapEntryItem.durationSeconds / totalViewSeconds) * 100,
            item: gapEntryItem,
          };
          calculatedEntryItems.push(gapItem);
          previousTimeMark = moment(currentTime);
          currentTime = moment(this._timelogZoomControl.endTime);
        }
  
        if(this.viewEndsAfterBedtime()){


          let endingSleepItem: TimelogEntryItem = new TimelogEntryItem(previousTimeMark, currentTime);
          let endItem: any = {
            startTime: currentTime,
            totalSeconds: endingSleepItem.durationSeconds,
            percentOfTotal: (endingSleepItem.durationSeconds / totalViewSeconds) * 100,
            item: endingSleepItem,
          };
          calculatedEntryItems.push(endItem);
          previousTimeMark = moment(currentTime);
          currentTime = moment(this._timelogZoomControl.endTime);


        }else{
          console.log("view end does not end after bed time.  What do ?")
        }
  
        let gridTemplateRows: string = "";
        calculatedEntryItems.forEach(item => {
          gridTemplateRows += "" + item.percentOfTotal.toFixed(2) + "% ";
        });
        console.log("Grid template rows:", gridTemplateRows)
        console.log("Setting the STYLEY")
        this._entryItemsNgStyle = { "grid-template-rows": gridTemplateRows };
        this._entryItems = calculatedEntryItems.map((item)=> { return item.item; });
  
      } else {
        console.log("View does not start after wakeup")
      }
    }else{
      console.log("sleep times not set.");
    }


    
  }

  private viewStartsAfterWakeup(): boolean {
    let viewStartsAfterWakeup: boolean;
    let sleepProfile: DaybookDayItemSleepProfile = this._activeDay.sleepProfile;
    if (!this._activeDay.sleepProfileIsSet) {
      viewStartsAfterWakeup = false;
    } else {
      viewStartsAfterWakeup = this._timelogZoomControl.startTime.isSameOrAfter(moment(sleepProfile.previousFallAsleepTimeISO))
        && this._timelogZoomControl.startTime.isSameOrBefore(moment(sleepProfile.wakeupTimeISO));
    }
    return viewStartsAfterWakeup;
  }
  private viewEndsAfterBedtime(): boolean {
    let viewEndsAfterBedtime: boolean;
    let sleepProfile: DaybookDayItemSleepProfile = this._activeDay.sleepProfile;
    if (!this._activeDay.sleepProfileIsSet) {
      viewEndsAfterBedtime = false;
    } else {
      viewEndsAfterBedtime = this._timelogZoomControl.endTime.isSameOrAfter(moment(sleepProfile.bedtimeISO));
    }
    return viewEndsAfterBedtime;
  }


  private _entryItemsNgStyle: any = { "grid-template-rows": "1fr" };
  private _entryItems: TimelogEntryItem[] = [];

  public get entryItemsNgStyle(): any { return this._entryItemsNgStyle; }
  public get entryItems(): TimelogEntryItem[] { return this._entryItems; }
}