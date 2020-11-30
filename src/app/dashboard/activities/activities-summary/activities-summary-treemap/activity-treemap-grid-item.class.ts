import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { ActivityTreemapDataItemKlass } from './activity-treemap-data-item.class';

export class ActivityTreemapGridItem {

    private _width: number;
    private _height: number;
    private _depth: number;
    private _ratio: number;
    private _percentOfParent: number;
    private _percentOfTotal: number;
    private _dataItems: ActivityTreemapDataItemKlass[];

    private _childDataItems: ActivityTreemapDataItemKlass[];
    private _childTreeGridItems: ActivityTreemapGridItem[];
    private _rootGridTemplateRows: string;
    private _rootGridTemplateColumns: string;

    private _isTerminalItem: boolean;

    public get gridTemplateRows(): string { return this._rootGridTemplateRows; }
    public get gridTemplateColumns(): string { return this._rootGridTemplateColumns; }


    private _dataItem: ActivityTreemapDataItemKlass = null;
    private _activity: ActivityCategoryDefinition;
    private _name: string;

    public get dataItem(): ActivityTreemapDataItemKlass { return this._dataItem; }
    public get isTerminalItem(): boolean { return this._isTerminalItem; }

    public get width(): number { return this._width; }
    public get height(): number { return this._height; }

    public get isTall(): boolean { return this._ratio < 1; }
    public get isWide(): boolean { return this._ratio >= 1; }

    public get percentOfParent(): number { return this._percentOfParent; }
    public get percentOfTotal(): number { return this._percentOfTotal; }
    public get childTreeGridItems(): ActivityTreemapGridItem[] { return this._childTreeGridItems; }

    public get thresholdPercent(): number { return 20; }
    public get depth(): number { return this._depth; }

    public get hasActivity(): boolean { return this._activity !== null; }
    public get activity(): ActivityCategoryDefinition { return this._activity; }
    public get name(): string { return this._name; }

    constructor(width: number, height: number, dataItems: ActivityTreemapDataItemKlass[], percentOfParent: number, depth: number) {
        this._width = width;
        this._height = height;
        this._depth = depth;
        this._ratio = this._width / this._height;
        this._percentOfParent = percentOfParent;

        this._percentOfTotal = 0;
        this._isTerminalItem = false;
        this._childTreeGridItems = [];
        this._childDataItems = [];

        if (dataItems.length > 0) {
            this._activity = dataItems[0].activity;
            this._name = this._activity.name;
            this._dataItem = dataItems[0];
        }

        if (dataItems.length === 0) {
            console.log('error: DATA ITEMS.LENTH IS 0')
        } else if (dataItems.length === 1) {
            this._percentOfTotal = dataItems[0].percentOfChart;

            const item = dataItems[0];
            if (item.hasChildItems) {
                if (item.totalItemMs > 0) {
                    this._childDataItems = [item.cloneAsChildBranchItem(), ...item.childItems];
                } else {
                    this._childDataItems = item.childItems;
                }
                let percentOfTotal = 0;
                this._childDataItems.forEach(item => percentOfTotal += item.percentOfChart);
                this._percentOfTotal = percentOfTotal;
                console.log("percent of total is: " + percentOfTotal)
                this._recurse();
            } else {
                this._setTerminalItem(item);
            }
        } else if (dataItems.length > 1) {

            this._childDataItems = dataItems;
            let percentOfTotal = 0;
            this._childDataItems.forEach(item => percentOfTotal += item.percentOfChart);
            this._percentOfTotal = percentOfTotal;
            console.log("percent of total is: " + percentOfTotal)
            this._recurse();
        }
        // console.log("\n***CONSTRUCTING ACTIVITY-TREEMAP-GRID-ITEM\n" + "\n" +
        //     this.gap + "wxh = " + width + " x " + height + ", ratio : " + this._ratio +
        //     " is tall? " + this.isTall, " , dataitems: " + dataItems.length);
        this._setGrid();
    }

    private _setGrid() {

        this._rootGridTemplateColumns = 'auto';
        this._rootGridTemplateRows = 'auto';

        console.log("\n\nSETTING GRID FOR: " + this.name)
        let percentages: number[] = [];
        let sum = 0;
        if (this.isTall) {
            this._rootGridTemplateRows = '';
            this._rootGridTemplateColumns = 'auto';
            this._childTreeGridItems.forEach(item => {
                percentages.push(item.percentOfParent);
                sum += item.percentOfParent;
                console.log(" CHILD ITEM ( " + item.name + "): " + item.percentOfParent + "%")
                this._rootGridTemplateRows += item.percentOfParent.toFixed(3) + '% ';
            });
        } else if (this.isWide) {
            this._rootGridTemplateRows = 'auto';
            this._rootGridTemplateColumns = '';
            this._childTreeGridItems.forEach(item => {
                percentages.push(item.percentOfParent);
                sum += item.percentOfParent;
                console.log(" CHILD ITEM ( " + item.name + "): " + item.percentOfParent + "%")
                this._rootGridTemplateColumns += item.percentOfParent.toFixed(3) + '% ';
            });
        }
        console.log("percentages: ", percentages)
        console.log("Sum of percents: " + sum)
        console.log("ROWS AND COLUMSN ")
        console.log("   rows: " + this._rootGridTemplateRows)
        console.log("   cols: " + this._rootGridTemplateColumns)
    }

    private _setTerminalItem(dataItem: ActivityTreemapDataItemKlass) {
        this._dataItem = dataItem;
        this._name = this._dataItem.activity.name;
        // this._activity = this._dataItem.activity;
        this._isTerminalItem = true;
        console.log(this.gap + this.name + " is a terminal item.")
    }
    private _addRemainingItems(dataItems: ActivityTreemapDataItemKlass[]) {
        dataItems.forEach(item => this._addTreemapItem([item]));
    }


    public toString(): string {
        return '';
    }

    public get gap(): string {
        let gap = '';
        for (let i = 0; i < this._depth; i++) {
            gap += ' ';
        }
        return gap;
    }


    private _recurse() {
        console.log("\n")
        if (this._childDataItems.length === 1) {
            console.log(this.gap + "Recursing.  Solo item")
        } else if (this._childDataItems.length === 2) {
            console.log(this.gap + "Recursing.  2 itemss")
            const item1 = this._childDataItems[0];
            const item2 = this._childDataItems[1];
            if (this.isWide) {
                this._rootGridTemplateRows = '100%';
                this._rootGridTemplateColumns = '' + item1.branchPercentOfParent.toFixed(3)
                    + '% ' + item2.branchPercentOfParent.toFixed(3) + '%';
                this._childTreeGridItems = this._childDataItems.map(item => {
                    const height = this._height;
                    const width = (item.branchPercentOfParent / 100) * this._width;
                    return new ActivityTreemapGridItem(width, height, [item], item.branchPercentOfParent, this._depth + 1);
                });
            } else if (this.isTall) {
                this._rootGridTemplateRows = '' + item1.branchPercentOfParent.toFixed(3)
                    + '% ' + item2.branchPercentOfParent.toFixed(3) + '%';
                this._rootGridTemplateColumns = '100%';
                this._childTreeGridItems = this._childDataItems.map(item => {
                    const height = (item.branchPercentOfParent / 100) * this._height;
                    const width = this._width;
                    return new ActivityTreemapGridItem(width, height, [item], item.branchPercentOfParent, this._depth + 1);
                });
            }

        } else if (this._childDataItems.length > 2) {
            console.log(this.gap + "recursing:  multiple items: " + this._childDataItems.length);
            let remainingDataItems: ActivityTreemapDataItemKlass[] = [];
            // let sumOfItems = 0;
            // this._childDataItems.forEach(item => sumOfItems += item.branchPercentOfParent);
            // sumOfItems = Math.round(sumOfItems);
            // console.log("SUM OF ITEMS IS: " + sumOfItems)
            this._childDataItems.forEach(item => remainingDataItems.push(item));
            let count = 0;
            while (remainingDataItems.length > 0) {
                // console.log(this.tabs + " remaining items are: " + remainingDataItems.length, this._childDataItems.length)
                this._getNextItems(remainingDataItems);
                const buildRecursiveItemWith: ActivityTreemapDataItemKlass[] = [];
                // console.log("NEXT ITEMS COMPLETE.")
                // remainingDataItems.forEach(item => {
                //     console.log(this.gap + item.activity.name, item.branchPercentOfParent.toFixed(0) + '%', item.isFlaggedForNextRecursion)
                // })
                let allFlagged: boolean = true;
                remainingDataItems.forEach(item => {
                    if (item.isFlaggedForNextRecursion) {
                        buildRecursiveItemWith.push(item);
                    } else {
                        allFlagged = false;
                    }
                });
                if (allFlagged) {
                    this._addRemainingItems(remainingDataItems);
                    remainingDataItems = [];
                } else {
                    buildRecursiveItemWith.forEach(item => {
                        remainingDataItems.splice(remainingDataItems.indexOf(item), 1);
                    });
                    this._addTreemapItem(buildRecursiveItemWith);
                }



                count++;
                if (count > 5) {
                    console.log("*************************************************************************Brakes activated")
                    remainingDataItems = [];
                }
            }
        }
    }




    private _addTreemapItem(dataItems: ActivityTreemapDataItemKlass[]) {
        if (dataItems.length > 0) {
            let sumOfItemPercents: number = 0;
            dataItems.forEach(item => sumOfItemPercents += item.branchPercentOfParent);
            // let sumOfCurrentGridItems = 0;
            // this._childTreeGridItems.forEach(item => sumOfCurrentGridItems += item.percentOfParent);
            // let remainingWidth: number = 0;
            // let remainingHeight: number = 0;
            let itemWidth: number = 0;
            let itemHeight: number = 0;
            // console.log("Sum of item percent, sumofCurrentGridItems: " , sumOfItemPercents)
            if (this.isTall) {
                itemWidth = this._width;
                itemHeight = this._height * (sumOfItemPercents / 100);
            } else if (this.isWide) {
                itemWidth = this._width * (sumOfItemPercents / 100);
                itemHeight = this._height;
            }
            // console.log(this.gap + "creating new grid item: ", itemWidth, itemHeight, dataItems, sumOfItemPercents, this._depth);
            if (itemWidth > 1 && itemHeight > 1) {
                const newGridItem = new ActivityTreemapGridItem(itemWidth, itemHeight, dataItems, sumOfItemPercents, this._depth + 1);
                this._childTreeGridItems.push(newGridItem);
            } else {
                console.log("out of space?")
            }

        } else {
            console.log("error with data items");
        }

    }


    private _getNextItems(allRemainingItems: ActivityTreemapDataItemKlass[]): ActivityTreemapDataItemKlass[] {
        if (allRemainingItems.length <= 2) {
            allRemainingItems.forEach(item => item.isFlaggedForNextRecursion = true);
            return allRemainingItems;
        } else if (allRemainingItems.length > 2) {
            let sumPercentage = 0;
            let itemIndex = 0;
            const itemGroups: ActivityTreemapDataItemKlass[][] = [];
            let returnGroup: ActivityTreemapDataItemKlass[] = [];
            let currentGroup: ActivityTreemapDataItemKlass[] = [];
            for (let i = allRemainingItems.length - 1; i >= 0; i--) {
                currentGroup.push(allRemainingItems[i]);
                let sumOfCurrentGroup = 0;
                currentGroup.forEach(item => sumOfCurrentGroup += item.branchPercentOfParent);
                if (sumOfCurrentGroup > this.thresholdPercent) {
                    itemGroups.push(currentGroup)
                    // console.log(this.tabs + "itemsgroups is now: ", itemGroups);
                    currentGroup = [];
                }
            }
            if (currentGroup.length > 0) {
                itemGroups.push(currentGroup);
                currentGroup = [];
                // console.log(this.tabs + "itemsgroups is now: ", itemGroups);
            }
            if (itemGroups.length === 1) {
                returnGroup = itemGroups[0];
            } else if (itemGroups.length > 1) {
                if (this._itemsPassThreshold(itemGroups[itemGroups.length - 1])) {
                    returnGroup = itemGroups[itemGroups.length - 1];
                } else {
                    returnGroup = [
                        ...itemGroups[itemGroups.length - 1],
                        ...itemGroups[itemGroups.length - 2],
                    ];
                }
            }
            returnGroup.forEach(item => item.isFlaggedForNextRecursion = true);
            console.log("\n")
            console.log(this.gap + "return items are: \n" + returnGroup)
            return returnGroup;
        }


        const nextItems: ActivityTreemapDataItemKlass[] = [];
        allRemainingItems.forEach(item => {
            if (item.isFlaggedForNextRecursion) {
                const splicedItem = allRemainingItems.splice(allRemainingItems.indexOf(item), 1);
                nextItems.push(...splicedItem);
            }
        });
        console.log(this.gap + " returning Next items: ", nextItems);
        return nextItems;
    }

    private _itemsPassThreshold(remainingItems: ActivityTreemapDataItemKlass[]): boolean {
        let sumPercent = 0;
        remainingItems.forEach(item => sumPercent += item.branchPercentOfParent);
        return sumPercent >= this.thresholdPercent;
    }


    private _canBeSplit(percentages: { itemIndex: number, percentage: number, }[]): boolean {
        if (percentages.length > 1) {
            for (let i = 0; i < percentages.length; i++) {

            }
        } else {
            return false;
        }
    }

}
