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

  public get zoomButtons(): TimelogZoomItem[] { return this._zoomButtons; }

  ngOnInit() {
    this._zoomButtons = this.daybookDisplayService.zoomItems;
    this.daybookDisplayService.displayUpdated$.subscribe(change => {
      this._zoomButtons = this.daybookDisplayService.zoomItems;
    });
  }
  ngOnDestroy() {
    this._daybookSub.unsubscribe();
  }
  public onClickButton(zoomItem: TimelogZoomItem) {
    this.daybookDisplayService.onZoomChanged(zoomItem.zoomType);
  }




}
