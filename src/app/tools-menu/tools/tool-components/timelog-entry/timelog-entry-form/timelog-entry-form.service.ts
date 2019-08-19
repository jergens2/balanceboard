import { Injectable } from '@angular/core';
import { DaybookService } from '../../../../../dashboard/daybook/daybook.service';
import * as moment from 'moment';
import { DaybookTimelogEntryDataItem } from '../../../../../dashboard/daybook/api/data-items/daybook-timelog-entry-data-item.interface';
import { DayStructureSleepCycle } from '../../../../../dashboard/daybook/api/data-items/day-structure-sleep-cycle.enum';

@Injectable({
  providedIn: 'root'
})
export class TimelogEntryFormService {

  constructor(private daybookService: DaybookService) { }


  public timelogEntryStartTime(fromNow: moment.Moment): moment.Moment{
    return this.daybookService.today.timelogEntryStartTime(fromNow);
  }

  public saveTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem){
    this.daybookService.today.addTimelogEntryItem(timelogEntry);
  }
  public updateTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem){
    this.daybookService.today.updateTimelogEntry(timelogEntry);
  }

  public getSleepCycle(time: moment.Moment): DayStructureSleepCycle{
    return this.daybookService.getSleepCycle(time);
  }

}
