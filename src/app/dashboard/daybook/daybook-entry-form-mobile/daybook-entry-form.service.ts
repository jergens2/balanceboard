import { Injectable } from '@angular/core';
import { DaybookService } from '../daybook.service';
import * as moment from 'moment';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';

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
    this.daybookService.today.addTimelogEntryItem(timelogEntry);
  }
  public updateTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem){
    this.daybookService.today.updateTimelogEntry(timelogEntry);
  }



}
