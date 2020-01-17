import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { faCog, faEye, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import * as moment from 'moment';
import { DayStructureDataItem } from '../../../api/data-items/day-structure-data-item.interface';
import { DaybookService } from '../../../daybook.service';
import { TimelogZoomControl } from './timelog-zoom-controller/timelog-zoom-control.interface';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { DaybookController } from '../../../controller/daybook-controller.class';

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
  // public activeDayController: DaybookController;

  ngOnInit() {
    console.log("This component gets the firstTLEF time from controller")
    this.zoomControl = { 
      icon: null,
      name: "AWAKE",
      isActive: true,
      isFirst: false,
      isLast: false,
      startTime: moment(this.daybookService.activeDayController.wakeupTime), 
      endTime: moment(this.daybookService.activeDayController.fallAsleepTime) 
    };
    // this.activeDayController = this.daybookService.activeDayController;
    // this.daybookService.activeDayController$.subscribe((dayChanged)=>{
    //   this.activeDayController = dayChanged;
    // });
  }


  public onClickHeaderItem(item: string){
    console.log("header item clicked: ", item);
  }

  public showTimelogBody: boolean = true;
  public showTimelogList: boolean = false;

  public onZoomControlChanged(changedZoomControl: TimelogZoomControl){
    this.zoomControl = changedZoomControl;
    if(this.zoomControl.name === "LIST"){
      this.showTimelogBody = false;
      this.showTimelogList = true; 
    }else{
      this.showTimelogList = false;
      this.showTimelogBody = true;
    }
  }
  public onZoomHover(zoomButton: TimelogZoomControl){
    this._zoomHover = zoomButton;
  }

  private _zoomHover: TimelogZoomControl = null;
  public get zoomHover(): TimelogZoomControl{ return this._zoomHover; }
  public zoomControl: TimelogZoomControl;

  faCog = faCog;
  faEye = faEye;
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
}
