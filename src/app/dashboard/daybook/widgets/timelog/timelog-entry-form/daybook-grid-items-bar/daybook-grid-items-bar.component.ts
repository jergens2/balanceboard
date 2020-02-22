import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { DaybookControllerService } from '../../../../controller/daybook-controller.service';
import { DisplayGridBarItem } from './display-grid-bar-item.class';
import { DaybookAvailabilityType } from '../../../../controller/items/daybook-availability-type.enum';
import { ToolboxService } from '../../../../../../toolbox-menu/toolbox.service';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { TimelogEntryFormService } from '../timelog-entry-form.service';
import { DaybookDisplayService } from '../../../../../daybook/daybook-display.service';

@Component({
  selector: 'app-daybook-grid-items-bar',
  templateUrl: './daybook-grid-items-bar.component.html',
  styleUrls: ['./daybook-grid-items-bar.component.css']
})
export class DaybookGridItemsBarComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService, private tlefService: TimelogEntryFormService ) { }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment;

  private _items: DisplayGridBarItem[] = [];

  public get items(): DisplayGridBarItem[] { return this._items; }

  public get startTime(): moment.Moment{ return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }

  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;

  private _daybookSub: Subscription = new Subscription();
  private _toolboxSub: Subscription = new Subscription();

  ngOnInit() {
    this.reload();
    this.daybookDisplayService.displayUpdated$.subscribe((change)=>{
      this.reload();
    });
  }

  private reload(){
    this._startTime = this.daybookDisplayService.displayStartTime;
    this._endTime = this.daybookDisplayService.displayEndTime;
    this._items = this.tlefService.gridBarItems;
    
  }



  public ngOnDestroy(){
    this._daybookSub.unsubscribe();
    this._toolboxSub.unsubscribe();
  }

  public onClickItem(item: DisplayGridBarItem) {
    this.tlefService.onClickGridItem(item);
  }

  public onClickGoLeft(){
    this.tlefService.gridBarGoLeft();
  }
  public onClickGoRight(){
    this.tlefService.gridBarGoRight();
  }


  private _updateOnItemChange(toolChange: {startTime: moment.Moment, endTime: moment.Moment}){
    // if(toolChange){
    //   // console.log("Tool change "  +  toolChange.startTime.format('YYYY-MM-DD hh:mm a') + " to " + toolChange.endTime.format('YYYY-MM-DD hh:mm a'))
    
    //   const foundItem = this._gridBarItems.find((item)=>{
    //     const startsAfterStart = item.startTime.isSameOrAfter(toolChange.startTime);
    //     const startsBeforeEnd = item.startTime.isSameOrBefore(toolChange.endTime);
    //     const endsAfterStart = item.endTime.isSameOrAfter(toolChange.startTime);
    //     const endsBeforeEnd = item.endTime.isSameOrBefore(toolChange.endTime);
    //     return startsAfterStart && startsBeforeEnd && endsAfterStart && endsBeforeEnd;
    //   });
    //   if(foundItem){
    //     this._gridBarItems.forEach((item)=>{
    //       item.isActive = false;
    //     });
    //     foundItem.isActive = true;
    //   }else{
    //     console.log("Error: unable to find grid item from toolChange : " + toolChange.startTime.format('hh:mm a') + " to " + toolChange.endTime.format('hh:mm a') )
    //   }
    // }else{
    //   this._gridBarItems.forEach((item)=>{
    //     item.isActive = false;
    //   });
    // }
    
  }


}
