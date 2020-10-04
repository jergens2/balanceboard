import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TLEFCircleButton } from './tlef-circle-button.class';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { ActivityHttpService } from '../../../../../../activities/api/activity-http.service';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { TLEFController } from '../../TLEF-controller.class';

@Component({
  selector: 'app-tlef-circle-buttons-bar',
  templateUrl: './tlef-circle-buttons-bar.component.html',
  styleUrls: ['./tlef-circle-buttons-bar.component.css']
})
export class TLEFCircleButtonsBarComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService, private activitiesService: ActivityHttpService) { }


  private _gridBarItems: TLEFCircleButton[];

  public get items(): TLEFCircleButton[] { return this._gridBarItems; }

  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;

  private _subs: Subscription[] = [];

  ngOnInit() {
    this._reload();
    this._subs = [
      this.daybookDisplayService.tlefController.currentlyOpenTLEFItem$.subscribe((change) => {
        if (change) { this._reload(); }
      }),
    ];

  }

  private _reload() {
    this._gridBarItems = this.daybookDisplayService.tlefController.tlefCircleButtons;
  }


  public ngOnDestroy() {
    // this._daybookSub.unsubscribe();
    // this._toolboxSub.unsubscribe();
  }

  public onClickItem(item: TLEFCircleButton) {
    this.daybookDisplayService.displayManager.openItemByIndex(item.itemIndex);
  }

  public onClickGoLeft() {
    this.daybookDisplayService.displayManager.openItemToTheLeft();
  }
  public onClickGoRight() {
    this.daybookDisplayService.displayManager.openItemToTheRight();
  }


  private _updateOnItemChange(toolChange: { startTime: moment.Moment, endTime: moment.Moment }) {
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
