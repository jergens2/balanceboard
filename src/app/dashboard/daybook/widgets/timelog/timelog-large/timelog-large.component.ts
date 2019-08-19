import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { faCog, faEye } from '@fortawesome/free-solid-svg-icons';
import { TimelogService } from '../timelog.service';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import * as moment from 'moment';
import { DayStructureDataItem } from '../../../api/data-items/day-structure-data-item.interface';

@Component({
  selector: 'app-timelog-large',
  templateUrl: './timelog-large.component.html',
  styleUrls: ['./timelog-large.component.css']
})
export class TimelogLargeComponent implements OnInit {

  faCog = faCog;
  faEye = faEye;

  constructor(private timelogService: TimelogService) { }

  @Input() activeDay: DaybookDayItem;

  ngOnInit() {
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

  public get filteredStructureItems(): DayStructureDataItem[] { 
    return this.activeDay.dayStructureDataItems.filter((item)=>{
      return item.startTimeISO != item.endTimeISO;
    });
  }

}
