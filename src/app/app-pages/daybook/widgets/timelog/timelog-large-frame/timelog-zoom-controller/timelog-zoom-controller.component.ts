import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogZoomItem } from './timelog-zoom-item.class';
import { faWrench, faSun, faListUl } from '@fortawesome/free-solid-svg-icons';
import { Subscription, timer } from 'rxjs';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { TimelogZoomType } from './timelog-zoom-type.enum';
import { DaybookDisplayService } from '../../../../daybook-display.service';

@Component({
  selector: 'app-timelog-zoom-controller',
  templateUrl: './timelog-zoom-controller.component.html',
  styleUrls: ['./timelog-zoom-controller.component.css']
})
export class TimelogZoomControllerComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService) { }

  private _zoomButtons: TimelogZoomItem[] = [];

  private _daybookSub: Subscription = new Subscription();
  private _times: string;

  public get zoomButtons(): TimelogZoomItem[] { return this._zoomButtons; }
  public get times(): string { return this._times; }

  ngOnInit() {
    this._zoomButtons = this.daybookDisplayService.zoomItems;
    this._setTimesString();
    this.daybookDisplayService.displayUpdated$.subscribe(change => {
      this._zoomButtons = this.daybookDisplayService.zoomItems;
      this._setTimesString();
    });
  }
  ngOnDestroy() {
    this._daybookSub.unsubscribe();
  }

  public onClickButton(zoomItem: TimelogZoomItem) {
    this.daybookDisplayService.onZoomChanged(zoomItem.zoomType);
  }

  private _setTimesString() {
    const startTime: moment.Moment = moment(this.daybookDisplayService.displayStartTime);
    const endTime: moment.Moment = moment(this.daybookDisplayService.displayEndTime);


    this._times = startTime.format('h:mm a') + " to " + endTime.format('h:mm a');

  }


}
