import { Component, OnInit } from '@angular/core';
import { TimelogEntryItem } from '../timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookDisplayService } from '../../../../daybook-display.service';
import { AppScreenSizeService } from 'src/app/shared/app-screen-size/app-screen-size.service';


@Component({
  selector: 'app-timelog-entry-list',
  templateUrl: './timelog-entry-list.component.html',
  styleUrls: ['./timelog-entry-list.component.css']
})
export class TimelogEntryListComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService, private sizeService: AppScreenSizeService) { }

  private _timelogEntryItems: TimelogEntryItem[] = [];
  private _maxHeightStyle: any = {};

  public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; }
  public get maxHeightStyle(): any { return this._maxHeightStyle; }



  ngOnInit() {

    const reduceBy: number = 108;
    let maxSize: number = this.sizeService.height - reduceBy;
    this._maxHeightStyle = { 'max-height': maxSize + 'px', };
    this.sizeService.height$.subscribe((height) => {
      maxSize = height - reduceBy;
      this._maxHeightStyle = { 'max-height': maxSize + 'px', };
    });

    this._update();
    this.daybookService.displayUpdated$.subscribe(() => this._update());
  }

  private _update() {
    this._timelogEntryItems = this.daybookService.daybookController.tleController.timelogEntryItems.filter((item) => {
      return item.startTime.isSameOrAfter(this.daybookService.displayStartTime) && item.endTime.isSameOrBefore(this.daybookService.displayEndTime);
    });
  }

}
