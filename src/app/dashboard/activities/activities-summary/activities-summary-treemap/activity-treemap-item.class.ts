import { ActivityTreemapDataItem } from "./activity-treemap-data-item.interface";

export class ActivityTreemapItem {


    private _dataItem: ActivityTreemapDataItem;

    public get hasNodeActivity(): boolean { return this._dataItem.nodeActivity !== null; }
    public get hasChildren(): boolean { return this._dataItem.childItems.length > 0; }

    public get totalChartMs(): number { return this._dataItem.totalChartMs; }
    public get totalBranchMs(): number { return this._dataItem.totalBranchMs; }
    public get percentOfTotal(): number { return this._dataItem.percentOfTotal; }
    public get percentOfParent(): number { return this._dataItem.percentOfParent; }

    constructor(dataItem: ActivityTreemapDataItem) {
        this._dataItem = dataItem;
    }
}
