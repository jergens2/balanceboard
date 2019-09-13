import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { faCog, faEye } from '@fortawesome/free-solid-svg-icons';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import * as moment from 'moment';
import { DayStructureDataItem } from '../../../api/data-items/day-structure-data-item.interface';
import { DaybookService } from '../../../daybook.service';

@Component({
  selector: 'app-timelog-large',
  templateUrl: './timelog-large.component.html',
  styleUrls: ['./timelog-large.component.css']
})
export class TimelogLargeComponent implements OnInit {

  faCog = faCog;
  faEye = faEye;

  constructor(private daybookService: DaybookService) { }

  // private _activeDay: DaybookDayItem;
  // public get activeDay():DaybookDayItem{
  //   return this._activeDay;
  // }
  // public set activeDay(activeDay: DaybookDayItem){
  //   this._activeDay = activeDay;
  // }
  public activeDay: DaybookDayItem;

  ngOnInit() {
    this.activeDay = this.daybookService.activeDay;
    this.daybookService.activeDay$.subscribe((dayChanged)=>{
      this.activeDay = dayChanged;
    });
  }

  public get timelogEntries(): DaybookTimelogEntryDataItem[] {
    return this.activeDay.daybookTimelogEntryDataItems;
  }

  public onMouseOverTimelog(){
    this._mouseOverTimelog = true;
  }
  public onMouseLeaveTimelog(){
    this._mouseOverTimelog = false;
  }

  private _mouseOverTimelog: boolean = false;
  public get mouseOverTimelog(): boolean{
    return this._mouseOverTimelog;
  }

  public onClickChangeView(view: string){
    this._viewMode = view;
  }

  private _viewMode: string = "timelog";
  public get viewMode(): string{
    return this._viewMode;
  }

  public timeFormat(timeISO: string): string{
    return moment(timeISO).format("hh:mm a")
  }



}
