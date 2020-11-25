import { Component, Input, OnInit } from '@angular/core';
import { ActivityTreemapDataItem } from './activity-treemap-data-item.class';
import { ActivityTreemapGridItem } from './activity-treemap-grid-item.class';

@Component({
  selector: 'app-activity-summary-treemap-item',
  templateUrl: './activity-summary-treemap-item.component.html',
  styleUrls: ['./activity-summary-treemap-item.component.css']
})
export class ActivitySummaryTreemapItemComponent implements OnInit {

  constructor() { }

  @Input() gridItem: ActivityTreemapGridItem;

  public get childItems(): ActivityTreemapGridItem[] { return this.gridItem.childTreeGridItems; }
  public get percentOfParent(): number { return this.gridItem.percentOfParent; }

  public get hasSoloItem(): boolean { return this.gridItem.hasSoloItem; }
  public get soloItem(): ActivityTreemapDataItem { return this.gridItem.soloItem; }

  ngOnInit(): void {
  }

}
