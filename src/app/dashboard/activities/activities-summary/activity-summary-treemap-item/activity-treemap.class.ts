import { ActivityDefinitionTree } from '../../api/activity-definition-tree.class';
import { ADIOccurrenceData } from '../../activity-display-item/adi-parts/adi-summary/adi-occurrence-data.interface';
import { ActivityTreemapDataItem } from './activity-treemap-data-item.class';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { ActivityTreemapGridItem } from './activity-treemap-grid-item.class';

export class ADITreemap {

    private _rootActivities: ActivityCategoryDefinition[];
    private _chartWidth: number;
    private _chartHeight: number;
    private _totalChartMs: number;
    private _chartRatio: number;

    private _activityOccurrenceData: ADIOccurrenceData[];
    private _rootTreeDataItems: ActivityTreemapDataItem[];
    private _rootGridTemplateRows: string;
    private _rootGridTemplateColumns: string;

    private _originalTreemapGridItem: ActivityTreemapGridItem;

    public get rootTreeDataItems(): ActivityTreemapDataItem[] { return this._rootTreeDataItems; }

    public get rootGridTemplateRows(): string { return this._rootGridTemplateRows; }
    public get rootGridTemplateColumns(): string { return this._rootGridTemplateColumns; }

    public get originalTreemapGridItem(): ActivityTreemapGridItem { return this._originalTreemapGridItem; }

    public get totalChartMs(): number { return this._totalChartMs; }
    public get chartIsWide(): boolean { return this._chartRatio >= 1; }
    public get chartIsTall(): boolean { return this._chartRatio < 1; }

    public get chartWidth(): number { return this._chartWidth; }
    public get chartHeight(): number { return this._chartHeight; }

    public get thresholdPercent(): number { return 20; }


    /**
     * A recursive class that will make child items of itself.
     * 
     */
    constructor(rootActivities: ActivityCategoryDefinition[],
        width: number, height: number, occurrenceData: ADIOccurrenceData[], totalChartMs: number) {
        this._rootActivities = rootActivities;
        this._chartWidth = width;
        this._chartHeight = height;
        this._chartRatio = this._chartWidth / this._chartHeight;
        this._totalChartMs = totalChartMs;
        this._activityOccurrenceData = occurrenceData;


        // console.log('Building tree map')
        this._calculateTreemapItems();
        // console.log('ROOT TREE DATA ITEMS: ')
        // this.rootTreeDataItems.forEach(item => // console.log('  '+ item.toString(1)))

        // console.log('Creatiing original treemap item: ');
        this._originalTreemapGridItem = new ActivityTreemapGridItem(this._chartWidth, this._chartHeight, this._rootTreeDataItems, 0);
    }


    private _calculateTreemapItems() {
        this._rootTreeDataItems = this._rootActivities.map(rootActivity => {
            const branchOccurrenceData = this._activityOccurrenceData.filter(activityData => {
                return rootActivity.getAllBranchActivityTreeIds().indexOf(activityData.activityTreeId) > -1;
            });
            return new ActivityTreemapDataItem(rootActivity, this._totalChartMs, branchOccurrenceData, true);
        }).sort((treeItem1, treeItem2) => {
            if (treeItem1.branchPercentOfParent > treeItem2.branchPercentOfParent) {
                return -1;
            } else if (treeItem1.branchPercentOfParent < treeItem2.branchPercentOfParent) {
                return 1;
            } else {
                return 0;
            }
        }).filter(item => item.totalBranchMs > 0);
    }



    

}
