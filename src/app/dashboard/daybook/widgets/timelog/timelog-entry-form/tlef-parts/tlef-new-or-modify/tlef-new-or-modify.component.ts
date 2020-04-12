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
    this._entryItem = this._controller.currentlyOpenTLEFItem.getInitialTLEValue();
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
    console.log("Activities changed: " + activities.length)
    const isSame = this._isSame(activities, this._initialActivities)
    if (isSame) {
      console.log("They are the same.")
    } else {
      console.log("They are NOT the same")
      this._entryItem.timelogEntryActivities = activities;
      this.controller.makeChangesTLE(this._entryItem);
    }
  }

  private _isSame(array1: TimelogEntryActivity[], array2: TimelogEntryActivity[]): boolean {
    let isSame: boolean = false;
    if (array1.length === array2.length) {
      if (array1.length === 0) {
        isSame = true;
      } else {
        let allMatch: boolean = true
        array1.forEach(arrayItem => {
          if (array2.indexOf(arrayItem) === -1) {
            allMatch = false;
          }
        });
        isSame = allMatch;
      }
    }
    return isSame;
  }

}
