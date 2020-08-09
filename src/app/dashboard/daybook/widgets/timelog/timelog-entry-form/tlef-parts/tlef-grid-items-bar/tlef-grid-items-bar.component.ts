import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TLEFGridBarItem } from './tlef-grid-bar-item.class';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { ActivityHttpService } from '../../../../../../activities/api/activity-http.service';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { TLEFController } from '../../TLEF-controller.class';

@Component({
  selector: 'app-tlef-grid-items-bar',
  templateUrl: './tlef-grid-items-bar.component.html',
  styleUrls: ['./tlef-grid-items-bar.component.css']
})
export class TLEFGridItemsBarComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService, private activitiesService: ActivityHttpService ) { }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _tlefController: TLEFController;

  public get items(): TLEFGridBarItem[] { return this._tlefController.gridBarItems; }

  public get startTime(): moment.Moment{ return this.daybookDisplayService.displayStartTime; }
  public get endTime(): moment.Moment { return this.daybookDisplayService.displayEndTime; }

  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;

  private _subs: Subscription[] = [];

  ngOnInit() {
    this._reload();
    this._subs = [
      this.daybookDisplayService.tlefController.currentlyOpenTLEFItem$.subscribe((change)=>{
        if(change){ this._reload(); }
      }),
    ];
    
  }

  private _reload(){
    this._startTime = this.daybookDisplayService.displayStartTime;
    this._endTime = this.daybookDisplayService.displayEndTime;
    this._tlefController = this.daybookDisplayService.tlefController;
  }


  public ngOnDestroy(){
    // this._daybookSub.unsubscribe();
    // this._toolboxSub.unsubscribe();
  }

  public onClickItem(item: TLEFGridBarItem) {
      this.daybookDisplayService.tlefController.onClickGridBarItem(item);
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
