import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { DaybookControllerService } from '../../../../../controller/daybook-controller.service';
import { TLEFGridBarItem } from './tlef-grid-bar-item.class';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { ActivityCategoryDefinitionService } from '../../../../../../activities/api/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';

@Component({
  selector: 'app-tlef-grid-items-bar',
  templateUrl: './tlef-grid-items-bar.component.html',
  styleUrls: ['./tlef-grid-items-bar.component.css']
})
export class TLEFGridItemsBarComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService, private activitiesService: ActivityCategoryDefinitionService ) { }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment;

  private _items: TLEFGridBarItem[] = [];

  public get items(): TLEFGridBarItem[] { return this.daybookDisplayService.tlefController.gridBarItems; }

  public get startTime(): moment.Moment{ return this.daybookDisplayService.displayStartTime; }
  public get endTime(): moment.Moment { return this.daybookDisplayService.displayEndTime; }

  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;

  public get isDrawing(): boolean { return this.daybookDisplayService.tlefController.currentlyOpenTLEFItem.isDrawing; }

  private _daybookSub: Subscription = new Subscription();
  private _toolboxSub: Subscription = new Subscription();

  ngOnInit() {
  }

  // private reload(){
    // this._startTime = this.daybookDisplayService.displayStartTime;
    // this._endTime = this.daybookDisplayService.displayEndTime;
    // this._items = this.daybookDisplayService.gridBarItems;
  // }


  public ngOnDestroy(){
    // this._daybookSub.unsubscribe();
    // this._toolboxSub.unsubscribe();
  }

  public onClickItem(item: TLEFGridBarItem) {
    if(!this.isDrawing){
      this.daybookDisplayService.tlefController.onClickGridBarItem(item);
    }
    

  }

  public onClickGoLeft(){
    this.daybookDisplayService.tlefController.goLeft();
  }
  public onClickGoRight(){
    this.daybookDisplayService.tlefController.goRight();
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
