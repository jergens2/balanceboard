import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { faCog, faEye, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import * as moment from 'moment';
import { DayStructureDataItem } from '../../../api/data-items/day-structure-data-item.interface';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';
import { TimelogZoomControllerItem } from './timelog-zoom-controller/timelog-zoom-controller-item.class';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { DaybookController } from '../../../controller/daybook-controller.class';

@Component({
  selector: 'app-timelog-large-frame',
  templateUrl: './timelog-large-frame.component.html',
  styleUrls: ['./timelog-large-frame.component.css']
})
export class TimelogLargeFrameComponent implements OnInit {

  constructor(private daybookControllerService: DaybookControllerService) { }


  ngOnInit() {

  }


  public onClickHeaderItem(item: string){
    console.log("header item clicked: ", item);
  }

  public showTimelogBody: boolean = true;
  public showTimelogList: boolean = false;

  
  faCog = faCog;
  faEye = faEye;
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
}
