import { Component, Input, OnInit } from '@angular/core';
import { max } from 'moment';
import { ActivityComponentService } from '../../../activity-component.service';
import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';
import { ActivityTreemapDataItem } from '../activity-treemap-data-item.interface';
import { ActivityTreemapService } from '../activity-treemap.service';

@Component({
  selector: 'app-ast-recursive-item',
  templateUrl: './ast-recursive-item.component.html',
  styleUrls: ['./ast-recursive-item.component.css']
})
export class AstRecursiveItemComponent implements OnInit {

  constructor(private treemapService: ActivityTreemapService, private activityService: ActivityComponentService) { }

  @Input() public item: ActivityTreemapDataItem;

  private _backgroundColor: string = 'white';
  private _showName: boolean = false;
  private _showVal: boolean = false;
  private _name: string = '';
  private _fontSize: string = '0.8em';

  public get totalChartMs(): number { return this.item.totalChartMs; }
  public get totalBranchMs(): number { return this.item.totalBranchMs; }
  public get percentOfTotal(): number { return this.item.percentOfTotal; }
  public get percentOfParent(): number { return this.item.percentOfParent; }
  public get widthPx(): string { return this.item.width + 'px'; }
  public get heightPx(): string { return this.item.height + 'px'; }
  public get width(): number { return this.item.width; }
  public get height(): number { return this.item.height; }
  public get hasNodeActivity(): boolean { return this.item.nodeActivity !== null; }
  public get nodeActivity(): ActivityCategoryDefinition { return this.item.nodeActivity; }
  public get nodeActivityMs(): number { return this.item.nodeActivityMs; }
  public get hasChildren(): boolean { return this.item.childItems.length > 0; }
  public get hasMultipleChildren(): boolean { return this.item.childItems.length > 1; }
  public get gridTemplateRows(): string { return this.item.gridTemplateRows; }
  public get gridTemplateColumns(): string { return this.item.gridTemplateColumns; }
  public get children(): ActivityTreemapDataItem[] { return this.item.childItems; }

  public get backgroundColor(): string { return this._backgroundColor; }
  public get fontSize(): string { return this._fontSize; }

  public get showName(): boolean { return this._showName; }
  public get showVal(): boolean { return this._showVal; }
  public get name(): string { return this._name; }

  ngOnInit(): void {
    // console.log("COMPONENT: item is: ", this.item);
    if (this.hasNodeActivity) {
      this._backgroundColor = this.nodeActivity.color;
      this._name = this.nodeActivity.name;
      const chars = this._name.length;
      const width = chars * 8;
      const rowCount = Math.floor(this.height / 16);
      const isWithinWidth = width < this.width;
      if (isWithinWidth && this.height > 16) {
        this._showName = true;
      } else if (this.height > 16) {
        const maxChars = Math.floor(this.width / 8) - 1;
        const activityNameLength = this.nodeActivity.name.length;
        let name = '';
        let index = 0;
        while (index < maxChars && index < activityNameLength) {
          name = name + this.nodeActivity.name[index];
          index++;
        }
        if (index > 2 && index < activityNameLength) {
          name += '..';
        }
        this._name = name;
        this._showName = true;
        // if(this.height >)
      }
      if(this.percentOfTotal > 5){
        this._fontSize = '1.2em';
      }
      if(this.percentOfTotal > 10){
        this._fontSize = '1.6em';
      }
      if(rowCount >= 2 && this.percentOfTotal > 2){
        this._showVal = true;
      }
    }
    // console.log("GRID STUFF:", this.gridTemplateColumns, this.gridTemplateRows)
  }

  public onMouseOver() {
    this.treemapService.showItem(this.item);
  }

  public onClick() {
    if (this.hasNodeActivity) {
      this.activityService.openActivity(this.nodeActivity);
    }

  }

}
