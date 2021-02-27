import { Component, Input, OnInit } from '@angular/core';
import { AppScreenSizeService } from '../../../../shared/app-screen-size/app-screen-size.service';
import { ActivityComponentService } from '../../activity-component.service';
import { ActivityTreemapDataItem } from './activity-treemap-data-item.interface';
import { ADITreemap } from './activity-treemap.class';
import { ActivityTreemapService } from './activity-treemap.service';

@Component({
  selector: 'app-activities-summary-treemap',
  templateUrl: './activities-summary-treemap.component.html',
  styleUrls: ['./activities-summary-treemap.component.css']
})
export class ActivitiesSummaryTreemapComponent implements OnInit {

  constructor(private treemapService: ActivityTreemapService, private activityService: ActivityComponentService) { }

  @Input() treemap: ADITreemap;

  private _displayItem: boolean = false;
  private _displayItemName: string;
  private _displayItemTotalHours: string;
  private _displayItemPercentOfTotal: string;
  private _displayItemParentName: string;
  private _displayItemPercentOfParent: string;
  private _displayItemColor: string;

  public get originalItem(): ActivityTreemapDataItem { return this.treemap.originalTreemapItem; }
  public get ogWidth(): string { return this.originalItem.width + 'px'; }
  public get ogHeight(): string { return this.originalItem.height + 'px'; }
  public get currentThreshold() { return this.treemap.thresholdPercent; }

  public get displayItem(): boolean { return this._displayItem; }
  public get displayItemName(): string { return this._displayItemName; }
  public get displayItemTotalHours(): string { return this._displayItemTotalHours; }
  public get displayItemPercentOfTotal(): string { return this._displayItemPercentOfTotal; }
  public get displayItemParentName(): string { return this._displayItemParentName; }
  public get displayItemPercentOfParent(): string { return this._displayItemPercentOfParent; }
  public get displayItemColor(): string { return this._displayItemColor; }


  ngOnInit(): void {
    
    this.treemapService.hoverItem$.subscribe(item => {
      if (item !== null) {
        this._updateDisplay(item);
      } else {
        this._clearDisplayItem();
      }
    });
  }


  private _updateDisplay(item: ActivityTreemapDataItem) {
    let name = 'Container';
    let color = 'white';
    let parentName = '';
    const tree = this.activityService.activityTree;
    if (item.nodeActivity !== null) {
      name = item.nodeActivity.name;
      color = item.nodeActivity.color;
      const parent = tree.findActivityByTreeId(item.nodeActivity.parentTreeId);
      if (parent) {
        parentName = parent.name;
      }
    }
    this._displayItemName = name;
    this._displayItemTotalHours = (item.totalBranchMs / (1000 * 60 * 60)).toFixed(1) + ' hours';
    this._displayItemParentName = parentName;
    this._displayItemPercentOfParent = item.percentOfParent.toFixed(1) + '%';
    this._displayItemPercentOfTotal = item.percentOfTotal.toFixed(1) + '%';
    this._displayItemColor = color;
    this._displayItem = true;
  }
  private _clearDisplayItem() {
    this._displayItem = false;
    this._displayItemName = '';
    this._displayItemTotalHours = '';
    this._displayItemParentName = '';
    this._displayItemPercentOfParent = '';
    this._displayItemPercentOfTotal = '';
    this._displayItemColor = '';

  }


  public onClickLeft() {
    this.treemap.decrementThreshold();
  }
  public onClickRight() {
    this.treemap.incrementThreshold();
  }

}
