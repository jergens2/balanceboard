import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookTimelogEntryDataItem } from '../../../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';
import { TLEFController } from '../../TLEF-controller.class';

@Component({
  selector: 'app-tlef-new-or-modify',
  templateUrl: './tlef-new-or-modify.component.html',
  styleUrls: ['./tlef-new-or-modify.component.css']
})
export class TlefNewOrModifyComponent implements OnInit, OnDestroy {

  constructor() { }

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { this._controller = controller; }
  public get controller(): TLEFController { return this._controller; }


  private _initialActivities: TimelogEntryActivity[] = [];
  private _entryItem: TimelogEntryItem;

  public get timelogEntry(): TimelogEntryItem { return this._entryItem; }

  public get initialActivities(): TimelogEntryActivity[] {
    return this._initialActivities;
  }

  ngOnInit() {
    console.log("ONINIT")
    // console.log("from service: " )
    // console.log("thing 1: " , this.tlefService.openedTimelogEntry)
    // console.log("thing 2: " , this.tlefService.openedTimelogEntry.timelogEntryActivities);
    this._setEntryItem();
  }
  ngOnDestroy() {
    console.log("DESTROY")
    this._entryItem = null;
    this._initialActivities = [];
  }

  private _setEntryItem() {
    this._entryItem = Object.assign({}, this._controller.currentlyOpenTLEFItem.getInitialTLEValue());
    this._initialActivities = [];
    // console.log("Setting entry itme in NEW OR MODIFY component " , this._entryItem)
    if (this._entryItem) {
      if (this._entryItem.timelogEntryActivities) {
        this._entryItem.timelogEntryActivities.forEach((item) => {
          this._initialActivities.push(item);
        });
      }
    }

    // console.log("initial activities: " + this._initialActivities.length , this._initialActivities)
  }

  public onActivitiesChanged(activities: TimelogEntryActivity[]) {
    if (this._initialActivities === activities) {

    } else {
      this._entryItem.timelogEntryActivities = activities;
      this._controller.makeChanges();
    }

    console.log("Update some changes here:  not implemented");
  }

}
