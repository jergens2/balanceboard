import { ActivityDefinitionTree } from '../../api/activity-definition-tree.class';
import { ADIOccurrenceData } from '../../activity-display-item/adi-parts/adi-summary/adi-occurrence-data.interface';
import { ActivityTreemapDataItemKlass } from './activity-treemap-data-item.class';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { ActivityTreemapGridItem } from './activity-treemap-grid-item.class';
import { ActivityTreemapDataItem } from './activity-treemap-data-item.interface';

export class ADITreemap {

    private _rootActivities: ActivityCategoryDefinition[];
    private _chartWidth: number;
    private _chartHeight: number;
    private _totalChartMs: number;
    private _chartRatio: number;

    private _activityOccurrenceData: ADIOccurrenceData[];
    private _rootTreeDataItems: ActivityTreemapDataItemKlass[];
    private _rootGridTemplateRows: string;
    private _rootGridTemplateColumns: string;

    private _originalTreemapGridItem: ActivityTreemapDataItem;

    public get rootTreeDataItems(): ActivityTreemapDataItemKlass[] { return this._rootTreeDataItems; }

    public get rootGridTemplateRows(): string { return this._rootGridTemplateRows; }
    public get rootGridTemplateColumns(): string { return this._rootGridTemplateColumns; }

    public get originalTreemapItem(): ActivityTreemapDataItem { return this._originalTreemapGridItem; }

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
        this._calculateTreemapItems2();
    }


    private _calculateTreemapItems2() {
        // console.log("Calculating treemapitems2");
        const ogItem: ActivityTreemapDataItem = {
            totalChartMs: this._totalChartMs,
            totalBranchMs: this._totalChartMs,
            percentOfTotal: 100,
            percentOfParent: 100,
            width: this._chartWidth,
            height: this._chartHeight,
            nodeActivity: null,
            nodeActivityMs: 0,
            childItems: [],
            gridTemplateColumns: 'auto',
            gridTemplateRows: 'auto',
        };
        const rootActivities = this._rootActivities;
        rootActivities.forEach(rootActivity => {
            const childItem = this._makeDataItem(rootActivity, this._totalChartMs);
            if (childItem.totalBranchMs > 0) {
                ogItem.childItems.push(childItem);
            }
        });
        this._configureItem(ogItem);
        // console.log("************** COMPLETE");
        // console.log("OG ITEM: ")
        // console.log(ogItem)
        this._originalTreemapGridItem = ogItem;
    }

    private _configureItem(treemapItem: ActivityTreemapDataItem) {
        let name = "CONTAINER OF " + treemapItem.childItems.length;
        if(treemapItem.nodeActivity){
            name = treemapItem.nodeActivity.name + ' ( ' + treemapItem.childItems.length + ' children) ';
        }
        // console.log("CONFIGURING TREEMAP ITEM: " + name, treemapItem.percentOfTotal);
        let recurseItems: {
            childItem: ActivityTreemapDataItem,
            percent: number,
            isThisNode: boolean,
        }[] = [];
        const hasNode: boolean = treemapItem.nodeActivity !== null;
        const isRecursive: boolean = treemapItem.childItems.length > 0;
        const currentRatio = treemapItem.width / treemapItem.height;
        const isTall = currentRatio < 1;
        const isWide = currentRatio >= 1;
        if (hasNode) {
            if (treemapItem.nodeActivityMs > 0) {
                let width = 0;
                let height = 0;
                if(isTall){
                    width = treemapItem.width;
                    height = (treemapItem.nodeActivityMs / treemapItem.totalBranchMs) * treemapItem.height;
                }else if(isWide){
                    width = (treemapItem.nodeActivityMs / treemapItem.totalBranchMs) * treemapItem.width;
                    height = treemapItem.height;
                }
                const asChildItem: ActivityTreemapDataItem = {
                    totalChartMs: this._totalChartMs,
                    totalBranchMs: treemapItem.nodeActivityMs,
                    percentOfTotal: (treemapItem.nodeActivityMs / this._totalChartMs) * 100,
                    percentOfParent: (treemapItem.nodeActivityMs / treemapItem.totalBranchMs) * 100,
                    width: width,
                    height: height,
                    nodeActivity: treemapItem.nodeActivity,
                    nodeActivityMs: treemapItem.nodeActivityMs,
                    gridTemplateRows: 'auto', gridTemplateColumns: 'auto',
                    childItems: [],
                };
                recurseItems.push({
                    childItem: asChildItem,
                    percent: (treemapItem.nodeActivityMs / treemapItem.totalBranchMs) * 100,
                    isThisNode: true,
                });
            }
        }
        if (isRecursive) {
            treemapItem.childItems.forEach(childItem => {
                recurseItems.push({
                    childItem: childItem,
                    percent: childItem.percentOfParent,
                    isThisNode: false,
                });
            });
            if (recurseItems.length > 0) {
                const recurseGroup = this._arrangeRecurseItems(recurseItems);
                const newRecurseItems: ActivityTreemapDataItem[] = [];
                let gridTemplateRows: string = '';
                let gridTemplateColumns: string = '';
                for (let i = 0; i < recurseGroup.length; i++) {
                    const recurseChild = recurseGroup[i].childItem;
                    let childWidth: number = 0;
                    let childHeight: number = 0;
                    if (isWide) {
                        childHeight = treemapItem.height;
                        childWidth = treemapItem.width * (recurseChild.percentOfParent / 100);
                        gridTemplateColumns += (recurseGroup[i].percent.toFixed(3) + '% ');
                        gridTemplateRows = 'auto';
                    } else if (isTall) {
                        childHeight = treemapItem.height * (recurseChild.percentOfParent / 100);
                        childWidth = treemapItem.width;
                        gridTemplateRows += (recurseGroup[i].percent.toFixed(3) + '% ');
                        gridTemplateColumns = 'auto';
                    }
                    recurseChild.width = childWidth;
                    recurseChild.height = childHeight;
                    if (!recurseGroup[i].isThisNode) {
                        this._configureItem(recurseChild);
                    }
                    newRecurseItems.push(recurseChild);
                }
                treemapItem.gridTemplateColumns = gridTemplateColumns;
                treemapItem.gridTemplateRows = gridTemplateRows;
                treemapItem.childItems = newRecurseItems;
            }
        }
    }



    /**
     * takes an array of all child items that need to be arranged.
     * what is returned is the completed item that has been automatically rearranged.
     * @param recurseItems 
     */
    private _arrangeRecurseItems(recurseItems: { childItem: ActivityTreemapDataItem, percent: number, isThisNode: boolean, }[]): {
        childItem: ActivityTreemapDataItem, percent: number, isThisNode: boolean,
    }[] {
        let currentGroup: { childItem: ActivityTreemapDataItem, percent: number, isThisNode: boolean, }[] = [];
        let recurseGroups: { childItem: ActivityTreemapDataItem, percent: number, isThisNode: boolean, }[][] = [];
        for (let i = recurseItems.length - 1; i >= 0; i--) {
            currentGroup.push(recurseItems[i]);
            let sumOfCurrentGroup = 0;
            currentGroup.forEach(item => sumOfCurrentGroup += item.percent);
            if (sumOfCurrentGroup >= this.thresholdPercent) {
                recurseGroups.push(currentGroup);
                currentGroup = [];
            }
        }
        if (currentGroup.length > 0) {
            if (currentGroup.length > 0) {
                recurseGroups.push(currentGroup);
                currentGroup = [];
            }
        }
        if (recurseGroups.length === 1) {
            // in this case, all items were added to the same group.
            return recurseGroups[0];
        } else if (recurseGroups.length > 1) {
            if (recurseGroups.length > 2) {
                let sumOfFirstGroup = 0;
                const group1 = recurseGroups[0];
                group1.forEach(item => sumOfFirstGroup += item.percent);
                if (sumOfFirstGroup < this.thresholdPercent) {
                    recurseGroups[1].forEach(group2Item => group1.push(group2Item));
                    recurseGroups.splice(1, 1);
                }
            }
            if (recurseGroups.length > 2) {
                const group2 = recurseGroups[1];
                for (let i = 2; i < recurseGroups.length; i++) {
                    const group = recurseGroups[i];
                    group.forEach(groupItem => group2.push(groupItem));
                }
                recurseGroups.splice(2);
            }
            // at this stage, recurseGroups should definitely be exactly 2 items.
            // console.log("RECURSE GROUPS SHOULD BE 2: ", recurseGroups.length === 2, recurseGroups.length);
            const returnGroup: { childItem: ActivityTreemapDataItem, percent: number, isThisNode: boolean, }[] = [];
            recurseGroups.forEach(recurseGroup => {
                if (recurseGroup.length === 1) {
                    returnGroup.push(recurseGroup[0]);
                } else if (recurseGroup.length > 1) {
                    let treeItemPercent = 0;
                    let totalBranchMs: number = 0;
                    const childItems: ActivityTreemapDataItem[] = [];
                    recurseGroup.forEach(groupItem => {
                        treeItemPercent += groupItem.percent;
                        totalBranchMs += groupItem.childItem.totalBranchMs;
                    });
                    recurseGroup.forEach(groupItem => {
                        const childItem = groupItem.childItem;
                        childItem.percentOfParent = (groupItem.childItem.totalBranchMs / totalBranchMs) * 100;
                        childItems.push(childItem);
                    });
                    const newTreeItem: ActivityTreemapDataItem = {
                        totalChartMs: this._totalChartMs,
                        totalBranchMs: totalBranchMs,
                        percentOfTotal: (totalBranchMs / this._totalChartMs) * 100,
                        percentOfParent: treeItemPercent,
                        width: 0, height: 0, nodeActivity: null, nodeActivityMs: 0,
                        gridTemplateRows: 'auto', gridTemplateColumns: 'auto',
                        childItems: childItems,
                    };
                    returnGroup.push({
                        childItem: newTreeItem,
                        percent: treeItemPercent,
                        isThisNode: false,
                    });
                } else if (recurseGroup.length === 0) {
                    console.log("error ???")
                }
            });
            // console.log("RETURNING RETURN GROUP: ", returnGroup);
            return returnGroup;
        }
        return [];
    }

    private _makeDataItem(activity: ActivityCategoryDefinition, parentMs: number): ActivityTreemapDataItem {
        let totalBranchMs: number = 0;
        let nodeActivityMs: number = 0;
        let childItems: ActivityTreemapDataItem[] = [];
        if (activity) {
            const branchData = this._activityOccurrenceData.filter(activityData => {
                return activity.getAllBranchActivityTreeIds().indexOf(activityData.activityTreeId) > -1;
            });
            const activityData = branchData.find(item => item.activityTreeId === activity.treeId);
            if (activityData) {
                nodeActivityMs = activityData.totalMs;
            }
            branchData.forEach(branchItem => totalBranchMs += branchItem.totalMs);
            if (activity.children.length > 0) {
                activity.children.forEach(childItem => {
                    const childDataItem = this._makeDataItem(childItem, totalBranchMs);
                    if (childDataItem.totalBranchMs > 0) {
                        childItems.push(childDataItem);
                    }
                });
            }
        }
        childItems = childItems.sort((c1, c2) => {
            if (c1.totalBranchMs > c2.totalBranchMs) {
                return -1;
            } else if (c1.totalBranchMs < c2.totalBranchMs) {
                return 1;
            } else {
                return 0;
            }
        });
        return {
            totalChartMs: this._totalChartMs,
            totalBranchMs: totalBranchMs,
            percentOfTotal: (totalBranchMs / this._totalChartMs) * 100,
            percentOfParent: (totalBranchMs / parentMs) * 100,
            width: this._chartWidth,
            height: this._chartHeight,
            nodeActivity: activity,
            nodeActivityMs: nodeActivityMs,
            childItems: childItems,
            gridTemplateColumns: 'auto',
            gridTemplateRows: 'auto',
        };
    }
}
