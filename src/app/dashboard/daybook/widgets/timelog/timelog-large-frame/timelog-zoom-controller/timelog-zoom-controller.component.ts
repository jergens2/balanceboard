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

  private _currentZoomLevel: TimelogZoomItem;
  private _currentTime: moment.Moment = moment();

  private _daybookSub: Subscription = new Subscription();

  ngOnInit() {
    this._buildZoomButtons();
    // this._daybookSub = this.daybookDisplayService.displayUpdated$.subscribe((update)=>{
    //   this._buildZoomButtons();
    // });
  }
  ngOnDestroy(){
    this._daybookSub.unsubscribe();
  }

  private _buildZoomButtons(){
    this._zoomButtons = this.daybookDisplayService.zoomItems;
  }

  public onClickButton(zoomItem: TimelogZoomItem){
    this.daybookDisplayService.onZoomChanged(zoomItem.zoomType);
  }

  private _zoomButtons: TimelogZoomItem[] = [];
  public get zoomButtons(): TimelogZoomItem[] { return this._zoomButtons; }


  faSun = faSun;

}
