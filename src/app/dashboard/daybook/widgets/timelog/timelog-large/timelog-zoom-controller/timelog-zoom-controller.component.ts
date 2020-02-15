import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogZoomControllerItem } from './timelog-zoom-controller-item.class';
import { DaybookControllerService } from '../../../../controller/daybook-controller.service';
import { faWrench, faSun, faListUl } from '@fortawesome/free-solid-svg-icons';
import { Subscription, timer } from 'rxjs';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { TimelogZoomType } from './timelog-zoom-type.enum';
import { DaybookDisplayService } from '../../../../../../dashboard/daybook/daybook-display.service';

@Component({
  selector: 'app-timelog-zoom-controller',
  templateUrl: './timelog-zoom-controller.component.html',
  styleUrls: ['./timelog-zoom-controller.component.css']
})
export class TimelogZoomControllerComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService) { }

  private _currentZoomLevel: TimelogZoomControllerItem;
  private _currentTime: moment.Moment = moment();

  private _daybookSub: Subscription = new Subscription();

  ngOnInit() {
    this._buildZoomButtons();
    this._daybookSub = this.daybookDisplayService.activeDayController$.subscribe((valueChanged)=>{
      this._buildZoomButtons();
    });
  }
  ngOnDestroy(){
    this._daybookSub.unsubscribe();
  }

  private _buildZoomButtons(){
    this._zoomButtons = this.daybookDisplayService.zoomItems;
  }

  public onClickButton(zoomItem: TimelogZoomControllerItem){
    this.daybookDisplayService.onZoomChanged(zoomItem);
  }

  private _zoomButtons: TimelogZoomControllerItem[] = [];
  public get zoomButtons(): TimelogZoomControllerItem[] { return this._zoomButtons; }


  faSun = faSun;

}
