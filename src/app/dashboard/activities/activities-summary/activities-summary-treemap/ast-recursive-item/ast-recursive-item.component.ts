import { Component, Input, OnInit } from '@angular/core';
import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';
import { ActivityTreemapDataItem } from '../activity-treemap-data-item.interface';

@Component({
  selector: 'app-ast-recursive-item',
  templateUrl: './ast-recursive-item.component.html',
  styleUrls: ['./ast-recursive-item.component.css']
})
export class AstRecursiveItemComponent implements OnInit {

  constructor() { }

  @Input() public item: ActivityTreemapDataItem;

  private _backgroundColor: string = 'white';

  public get totalChartMs(): number { return this.item.totalChartMs; }
  public get totalBranchMs(): number { return this.item.totalBranchMs; }
  public get percentOfTotal(): number { return this.item.percentOfTotal; }
  public get percentOfParent(): number { return this.item.percentOfParent; }
  public get width(): string { return this.item.width + 'px'; }
  public get height(): string { return this.item.height + 'px'; }
  public get hasNodeActivity(): boolean { return this.item.nodeActivity !== null; }
  public get nodeActivity(): ActivityCategoryDefinition { return this.item.nodeActivity; }
  public get nodeActivityMs(): number { return this.item.nodeActivityMs; }
  public get hasChildren(): boolean { return this.item.childItems.length > 0; }
  public get hasMultipleChildren(): boolean { return this.item.childItems.length > 1; }
  public get gridTemplateRows(): string { return this.item.gridTemplateRows; }
  public get gridTemplateColumns(): string { return this.item.gridTemplateColumns; }
  public get children(): ActivityTreemapDataItem[] { return this.item.childItems; }

  public get backgroundColor(): string { return this._backgroundColor; }


  ngOnInit(): void {
    // console.log("COMPONENT: item is: ", this.item);
    if (this.hasNodeActivity) {
      this._backgroundColor = this.nodeActivity.color;
    }
    // console.log("GRID STUFF:", this.gridTemplateColumns, this.gridTemplateRows)
  }

  public onClick() {
    if (this.hasNodeActivity) {
      console.log("ITEM CLICKED: " + this.item.nodeActivity.name + " : " + this.percentOfTotal.toFixed(1) + "%")
    } else {
      console.log("ITEM CLICKED: *container only* : " + this.percentOfTotal.toFixed(1) + "%")
    }

  }

}
