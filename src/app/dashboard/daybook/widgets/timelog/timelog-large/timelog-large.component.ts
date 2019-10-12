import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { faCog, faEye, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import * as moment from 'moment';
import { DayStructureDataItem } from '../../../api/data-items/day-structure-data-item.interface';
import { DaybookService } from '../../../daybook.service';
import { TimelogZoomButton } from './timelog-zoom-controller/timelog-zoom-button.interface';

@Component({
  selector: 'app-timelog-large',
  templateUrl: './timelog-large.component.html',
  styleUrls: ['./timelog-large.component.css']
})
export class TimelogLargeComponent implements OnInit {



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


  public onClickHeaderItem(item: string){
    console.log("header item clicked: ", item);
  }


  public onZoomChanged(zoomButton: TimelogZoomButton){
    this._zoom = zoomButton;
  }
  public onZoomHover(zoomButton: TimelogZoomButton){
    this._zoomHover = zoomButton;
  }

  private _zoomHover: TimelogZoomButton = null;
  public get zoomHover(): TimelogZoomButton{ return this._zoomHover; }
  private _zoom: TimelogZoomButton = { 
    icon: null,
    name: "AWAKE",
    isActive: true,
    isFirst: false,
    isLast: false,
    itemState: null,
    startTime: moment(this.daybookService.activeDay.wakeupTime), 
    endTime: moment(this.daybookService.activeDay.bedtime) 
  };
  public get zoom(): TimelogZoomButton { return this._zoom; }

  faCog = faCog;
  faEye = faEye;
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
}
