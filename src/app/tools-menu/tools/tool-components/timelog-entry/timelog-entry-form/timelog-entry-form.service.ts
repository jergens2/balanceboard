import { Injectable } from '@angular/core';
import { DaybookService } from '../../../../../dashboard/daybook/daybook.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class TimelogEntryFormService {

  constructor(private daybookService: DaybookService) { }


  public timelogEntryStartTime(fromNow: moment.Moment): moment.Moment{
    return this.daybookService.today.timelogEntryStartTime(fromNow);
  }

}
