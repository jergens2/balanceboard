import { ActivityDefinitionTree } from '../../api/activity-definition-tree.class';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { ADIOccurrence, ADIOccurrenceData } from '../../activity-display-item/adi-parts/adi-summary/adi-occurrence-data.interface';

export class ActivityTreemapDataItemKlass {

    private _activity: ActivityCategoryDefinition;

    private _isRootItem: boolean;

    private _branchOccurrenceData: ADIOccurrenceData[];
    private _totalItemMs: number;
    private _totalBranchMs: number;
    private _totalChartMs: number;

    private _parentBranchMs: number;
    private _branchPercentOfParent: number;
    private _percentOfChart: number;

    private _itemPercentOfBranch: number;
    private _childItems: ActivityTreemapDataItemKlass[];

    public get activity(): ActivityCategoryDefinition { return this._activity; }
    public get isRootItem(): boolean { return this._isRootItem; }
    public get totalItemMs(): number { return this._totalItemMs; }
    public get totalBranchMs(): number { return this._totalBranchMs; }

    public get parentMs(): number { return this._parentBranchMs; }

    public get branchPercentOfParent(): number { return this._branchPercentOfParent; }
    // public get itemPercentOfBranch(): number { return this._itemPercentOfBranch; }

    public get childItems(): ActivityTreemapDataItemKlass[] { return this._childItems; }
    public get hasChildItems(): boolean { return this.childItems.length > 0; }

    public get percentOfChart(): number { return this._percentOfChart; }

    /** Used by activity-treemap-grid-item.class to determine which items to recurse with */
    public isFlaggedForNextRecursion: boolean;

    constructor(
        
        activity: ActivityCategoryDefinition, 
        parentBranchMs: number, 
        totalChartMs: number,
        branchOccurrenceData: ADIOccurrenceData[], 
        isRootItem: boolean, 
        buildChildren = true
        ) {
        this._activity = activity;
        this._branchOccurrenceData = branchOccurrenceData;
        this._isRootItem = isRootItem;
        this._childItems = [];
        this._parentBranchMs = parentBranchMs;
        this._totalChartMs = totalChartMs;
        this._totalItemMs = 0;
        this._totalBranchMs = 0;
        this._itemPercentOfBranch = 0;
        this._branchPercentOfParent = 0;
        this._percentOfChart = 0;
        this.isFlaggedForNextRecursion = false;
        const thisOccurrenceData = branchOccurrenceData.find(item => item.activityTreeId === activity.treeId);
        if (thisOccurrenceData) {
            this._totalItemMs = thisOccurrenceData.totalMs;
            this._totalBranchMs = thisOccurrenceData.totalMs;
        }
        if (buildChildren) {
            this._buildChildItems();
        }
        this._calculateValues();
    }

    public clone(): ActivityTreemapDataItemKlass {
        return new ActivityTreemapDataItemKlass(this.activity, this._parentBranchMs, this._totalChartMs, this._branchOccurrenceData, this.isRootItem);
    }
    /**  when cloning this as a branch item, it means to convert a parent activity to a child of itself as a branch item,
     *  and return that child branch item. */
    public cloneAsChildBranchItem(): ActivityTreemapDataItemKlass {
        const clonedActivity = this.activity.cloneByHttpShape();
        const clonedItem = new ActivityTreemapDataItemKlass(clonedActivity, this._totalBranchMs, this._totalChartMs,
            this._branchOccurrenceData, this.isRootItem, false);
        // console.log("CLONED ITEM AS CHILD ITEM: ", clonedItem)
        return clonedItem;
    }

    private _buildChildItems() {
        const children: ActivityCategoryDefinition[] = this.activity.children;

        let totalBranchMs: number = this._totalItemMs;
        // this._childItems = 
        const childItems: ActivityTreemapDataItemKlass[] = [];

        children.filter(childActivity => {
            const branchOccurrenceData = this._branchOccurrenceData.filter(activityData => {
                return childActivity.getAllBranchActivityTreeIds().indexOf(activityData.activityTreeId) > -1;
            });
            let branchMs: number = 0;
            branchOccurrenceData.forEach(item => branchMs += item.totalMs);
            totalBranchMs += branchMs;
            this._totalBranchMs = totalBranchMs;
            return branchMs > 0;
        }).forEach(childActivity => {
            // // console.log("total branch ms: " + totalBranchMs)
            const branchOccurrenceData = this._branchOccurrenceData.filter(activityData => {
                return childActivity.getAllBranchActivityTreeIds().indexOf(activityData.activityTreeId) > -1;
            });
            childItems.push(new ActivityTreemapDataItemKlass(childActivity, this._totalBranchMs, this._totalBranchMs, branchOccurrenceData, false));
        });


        this._childItems = childItems.sort((treeItem1, treeItem2) => {
            if (treeItem1.branchPercentOfParent > treeItem2.branchPercentOfParent) {
                return -1;
            } else if (treeItem1.branchPercentOfParent < treeItem2.branchPercentOfParent) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    private _calculateValues() {
        if (this._totalBranchMs > 0) {
            this._branchPercentOfParent = (this._totalBranchMs / this._parentBranchMs) * 100;
            if (this._totalItemMs > 0) {
                this._itemPercentOfBranch = (this._totalItemMs / this._totalBranchMs) * 100;

            }
            this._percentOfChart = (this._totalBranchMs / this._totalChartMs) * 100;
        }
    }

    public toString(addItem: number): string {
        let val: string = '' + this.activity.name;
        let tabs = '';
        for (let i = 0; i < addItem; i++) {
            tabs += "\t";
        }
        val += '\n' + tabs + 'Total item ms: ' + this.totalItemMs;
        val += '\n' + tabs + 'total branch ms: ' + this.totalBranchMs;
        // if (this.hasChildItems) {
        //     val += '\n' + tabs + 'item % of this branch: ' + this.itemPercentOfBranch;
        // }
        val += '\n' + tabs + 'this branch % of parent branch: ' + this.branchPercentOfParent;
        val += '\n' + tabs + 'child items: ' + this.childItems.length;
        if (this.childItems.length > 0) {
            this.childItems.forEach(childItem => {
                val += "\n";
                val += childItem.toString(addItem + 1);
            });
            val += "\n";
        }
        return val;
    }
}

