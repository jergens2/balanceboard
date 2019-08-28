import { Injectable } from '@angular/core';
import { DaybookService } from '../../daybook.service';
import { DaybookDayItem } from '../../api/daybook-day-item.class';
import { Timelog } from './timelog.class';

@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  private _activeDay: DaybookDayItem;
  constructor(private daybookService: DaybookService) { 
    this.activeDay = daybookService.activeDay;
    daybookService.activeDay$.subscribe((changedDay)=>{
      console.log("day changed: ", changedDay.dateYYYYMMDD);
      this.activeDay = changedDay;
    })
  }

  set activeDay(activeDay: DaybookDayItem){
    this._activeDay = activeDay;
    this.rebuildTimelog();
  }

  get activeDay(): DaybookDayItem{
    return this._activeDay;
  }

  private rebuildTimelog(){
    console.log("Rebuilding timelog")
    let timelog: Timelog = new Timelog(this._activeDay);
  }
  


  
}
