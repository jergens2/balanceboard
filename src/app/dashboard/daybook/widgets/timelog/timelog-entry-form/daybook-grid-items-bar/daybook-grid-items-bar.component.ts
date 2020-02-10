import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { DaybookControllerService } from '../../../../controller/daybook-controller.service';
import { DisplayGridBarItem } from './display-grid-bar-item.class';
import { DaybookAvailabilityType } from '../../../../controller/items/daybook-availability-type.enum';
import { ToolboxService } from '../../../../../../toolbox-menu/toolbox.service';

@Component({
  selector: 'app-daybook-grid-items-bar',
  templateUrl: './daybook-grid-items-bar.component.html',
  styleUrls: ['./daybook-grid-items-bar.component.css']
})
export class DaybookGridItemsBarComponent implements OnInit {

  constructor(private daybookService: DaybookControllerService, private toolboxService: ToolboxService ) { }


  private _gridBarItems: DisplayGridBarItem[] = [];

  public get items(): DisplayGridBarItem[] { return this._gridBarItems; }

  @Input() startTime: moment.Moment;
  @Input() endTime: moment.Moment;

  ngOnInit() {
    if (this.startTime && this.endTime) {
      this._gridBarItems = this.daybookService.activeDayController.tlefGridDisplayItems;
    } else {
      console.log('Error:  missing time input.')
    }
  }

  
  

  public onClickItem(item: DisplayGridBarItem) {
    console.log("Item clicked ! " + item.startTime.format('YYYY-MM-DD hh:mm a') + " , " + item.availabilityType)
    if (item.availabilityType === DaybookAvailabilityType.SLEEP) {
      if(!item.sleepEntry){ console.log('Error:  no sleep entry value on item')}
      this.toolboxService.openToolSleepInput(item.sleepEntry);
    } else {
      if(!item.timelogEntry){ console.log('Error:  no sleep entry value on item')}
      this.toolboxService.openTimelogEntry(item.timelogEntry);
    }
  }
}
