import { Injectable } from '@angular/core';
import { DaybookService } from '../daybook.service';
import * as moment from 'moment';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';

@Injectable({
  providedIn: 'root'
})
export class DaybookEntryFormService {

  constructor(private daybookService: DaybookService) { }


  // public timelogEntryStartTime(fromNow: moment.Moment): moment.Moment{
  //   return this.daybookService.today.timelogEntryStartTime(fromNow);
  // }

  public saveTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem){
    console.log("Saving timelog entry in timelog entry service")
    let saveTimelogEntry: TimelogEntryItem = new TimelogEntryItem(moment(timelogEntry.startTimeISO), moment(timelogEntry.endTimeISO));
    saveTimelogEntry.note = timelogEntry.note;
    saveTimelogEntry.timelogEntryActivities = timelogEntry.timelogEntryActivities;
    this.daybookService.today.timelog.addTimelogEntryItem(saveTimelogEntry);
  }
  public updateTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem){
    let updateTimelogEntry: TimelogEntryItem = new TimelogEntryItem(moment(timelogEntry.startTimeISO), moment(timelogEntry.endTimeISO));
    updateTimelogEntry.note = timelogEntry.note;
    updateTimelogEntry.timelogEntryActivities = timelogEntry.timelogEntryActivities;
    this.daybookService.today.timelog.updateTimelogEntry(updateTimelogEntry);
  }



}
