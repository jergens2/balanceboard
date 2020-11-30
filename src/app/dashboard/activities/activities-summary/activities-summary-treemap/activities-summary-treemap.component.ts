import { Component, Input, OnInit } from '@angular/core';
import { ActivityTreemapDataItem } from './activity-treemap-data-item.interface';
import { ActivityTreemapGridItem } from './activity-treemap-grid-item.class';
import { ADITreemap } from './activity-treemap.class';

@Component({
  selector: 'app-activities-summary-treemap',
  templateUrl: './activities-summary-treemap.component.html',
  styleUrls: ['./activities-summary-treemap.component.css']
})
export class ActivitiesSummaryTreemapComponent implements OnInit {

  constructor() { }

  @Input() treemap: ADITreemap;

  public get originalItem(): ActivityTreemapDataItem { return this.treemap.originalTreemapItem; }
  public get ogWidth(): string { return this.originalItem.width + 'px'; }
  public get ogHeight(): string { return this.originalItem.height + 'px'; }

  ngOnInit(): void {

  }



}
