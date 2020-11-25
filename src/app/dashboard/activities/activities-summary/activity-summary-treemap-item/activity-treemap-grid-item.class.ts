import { ActivityTreemapDataItem } from './activity-treemap-data-item.class';

export class ActivityTreemapGridItem {

    private _width: number;
    private _height: number;
    private _depth: number;
    private _ratio: number;
    private _percentOfParent: number;

    private _childTreeGridItems: ActivityTreemapGridItem[];
    private _rootGridTemplateRows: string;
    private _rootGridTemplateColumns: string;


    private _soloItem: ActivityTreemapDataItem = null;

    public get soloItem(): ActivityTreemapDataItem { return this._soloItem; }
    public get hasSoloItem(): boolean { return this._soloItem !== null; }

    public get isTall(): boolean { return this._ratio < 1; }
    public get isWide(): boolean { return this._ratio >= 1; }

    public get percentOfParent(): number { return this._percentOfParent; }
    public get childTreeGridItems(): ActivityTreemapGridItem[] { return this._childTreeGridItems; }

    public get thresholdPercent(): number { return 20; }
    public get depth(): number { return this._depth; }

    constructor(width: number, height: number, dataItems: ActivityTreemapDataItem[], depth: number) {
        this._width = width;
        this._height = height;
        this._depth = depth;
        this._ratio = this._width / this._height;
        this._childTreeGridItems = [];

        if (dataItems.length === 0) {
            // console.log('error: DATA ITEMS.LENTH IS 0')
        } else if (dataItems.length === 1) {
            this._buildSoloItem(dataItems[0]);
        } else if (dataItems.length > 1) {
            this._recurse(dataItems);
        }


    }

    public toString(): string {
        return '';
    }

    public get tabs(): string {
        let tabs = '';
        for (let i = 0; i < this._depth; i++) {
            tabs += '\t';
        }
        return tabs;
    }

    private _buildSoloItem(dataItem: ActivityTreemapDataItem) {
        // console.log('Building solo item')
        this._soloItem = dataItem;
        if (dataItem.hasChildItems) {
            if (dataItem.totalItemMs > 0) {
                const branchItems = [dataItem.cloneAsBranchItem(), ...dataItem.childItems].sort((item1, item2) => {
                    if (item1.totalBranchMs > item2.totalBranchMs) {
                        return -1;
                    } else if (item1.totalBranchMs < item2.totalBranchMs) {
                        return 1;
                    }
                    return 0;

                });
                this._recurse(branchItems);
            } else {
                this._recurse(dataItem.childItems);
            }
        } else {

        }
    }
    private _recurse(dataItems: ActivityTreemapDataItem[]) {

        // console.log(this.tabs + 'RECURSING')
        if (dataItems.length === 2) {
            // console.log('DATA ITEMS.LENTH IS 2')
            const item1 = dataItems[0];
            const item2 = dataItems[1];
            if (this.isWide) {
                this._rootGridTemplateRows = '100%';
                this._rootGridTemplateColumns = '' + item1.branchPercentOfParent.toFixed(3)
                    + '% ' + item2.branchPercentOfParent.toFixed(3) + '%';
                this._childTreeGridItems = dataItems.map(item => {
                    const height = this._height;
                    const width = (item.branchPercentOfParent / 100) * this._width;
                    return new ActivityTreemapGridItem(width, height, [item], this._depth + 1);
                });
            } else if (this.isTall) {
                this._rootGridTemplateRows = '' + item1.branchPercentOfParent.toFixed(3)
                    + '% ' + item2.branchPercentOfParent.toFixed(3) + '%';
                this._rootGridTemplateColumns = '100%';
                this._childTreeGridItems = dataItems.map(item => {
                    const height = (item.branchPercentOfParent / 100) * this._height;
                    const width = this._width;
                    return new ActivityTreemapGridItem(width, height, [item], this._depth + 1);
                });
            }

        } else if (dataItems.length > 2) {
            // console.log('  ** Data items are greater than 2, so...')
            let remainingDataItems: ActivityTreemapDataItem[] = [];
            dataItems.forEach(item => {
                remainingDataItems.push(item.clone());
            });
            // console.log('REMAINING ITEMS: ')
            remainingDataItems.forEach(item => {
                // console.log(item.branchPercentOfParent.toFixed(1) + ' % of parent - ' + item.activity.name)
            })

            const treemapItems: ActivityTreemapGridItem[] = [];
            let count = 0;




            while (remainingDataItems.length > 0) {
                const nextItems = this._getNextItems(remainingDataItems);
                nextItems.forEach(item => {
                    // console.log(" ITEM: " + item.itemIndex + "  - " + item.percentage.toFixed(1) + '%')
                })
                const buildNextGridItemWith: ActivityTreemapDataItem[] = [];
                nextItems.forEach(item => {
                    const thisItemIndex = item.itemIndex;
                    // console.log("time to do some splicing: ", remainingDataItems.length);
                    // console.log("WE GONNA SPLICE: " + thisItemIndex)
                    for(let i=0; i<remainingDataItems.length; i++){
                        // console.log("   " + i + " : " + remainingDataItems[i].activity.name)
                    }


                    if (remainingDataItems.length - 1 >= thisItemIndex) {
                        // console.log(thisItemIndex + " -- " + remainingDataItems[thisItemIndex].activity.name)
                        buildNextGridItemWith.concat(remainingDataItems.splice(thisItemIndex, 1));
                        nextItems.forEach(itemAgain => {
                            if (itemAgain.itemIndex >= thisItemIndex) {
                                itemAgain.itemIndex -= 1;
                            }
                        });
                        // console.log("ITEMS ADJUSTED:")
                        nextItems.forEach(item => {
                            // console.log("   ITEM: " + item.itemIndex + "  - " + item.percentage.toFixed(1) + '%')
                        })
                    } else {
                        // console.log("no bueno")
                    }


                    // console.log("splicing complete: ", remainingDataItems.length);
                    for(let i=0; i<remainingDataItems.length; i++){
                        // console.log("   " + i + " : " + remainingDataItems[i].activity.name)
                    }
                    // console.log("\n\n")
                });
                this._addTreemapItem(buildNextGridItemWith);
            }

            if (remainingDataItems.length === 1) {
                // console.log('\t** FINAL ACTION')
                this._addTreemapItem(remainingDataItems);
            }
        }
    }


    private _addTreemapItem(dataItems: ActivityTreemapDataItem[]) {
        let sumOfItemPercents: number = 0;
        dataItems.forEach(item => sumOfItemPercents += item.branchPercentOfParent);
        let sumOfGridItems = 0;
        this._childTreeGridItems.forEach(item => sumOfGridItems += item.percentOfParent);
        let remainingWidth: number = 0;
        let remainingHeight: number = 0;
        let itemWidth: number = 0;
        let itemHeight: number = 0;
        if (this.isTall) {
            itemWidth = this._width;
            itemHeight = this._height * (sumOfItemPercents / 100);
            remainingHeight = this._height - (sumOfGridItems + sumOfItemPercents);
            remainingWidth = this._width;
        } else if (this.isWide) {
            itemWidth = this._width * (sumOfItemPercents / 100);
            itemHeight = this._height;
            remainingHeight = this._height;
            remainingWidth = this._width - (sumOfGridItems + sumOfItemPercents);
        }
        const newGridItem = new ActivityTreemapGridItem(remainingWidth, remainingHeight, dataItems, this._depth + 1);
        this._childTreeGridItems.push(newGridItem);
    }


    private _getNextItems(allRemainingItems: ActivityTreemapDataItem[]): { itemIndex: number, percentage: number, }[] {
        if (allRemainingItems.length === 1) {
            return [{
                itemIndex: 0,
                percentage: allRemainingItems[0].branchPercentOfParent,
            }];
        } else if (allRemainingItems.length > 1) {
            const allPercentages: {
                itemIndex: number,
                percentage: number,
            }[] = allRemainingItems.map(item => {
                const itemIndex = allRemainingItems.indexOf(item);
                return {
                    itemIndex: itemIndex,
                    percentage: item.branchPercentOfParent,
                };
            });
            let aboveThresholdGroups: { itemIndex: number, percentage: number, }[][] = [];
            let currentGroup: { itemIndex: number, percentage: number, }[] = [];
            for (let i = allPercentages.length - 1; i >= 0; i--) {
                currentGroup.push({
                    itemIndex: allPercentages[i].itemIndex,
                    percentage: allPercentages[i].percentage,
                });
                let sumOfCurrentGroup = 0;
                currentGroup.forEach(item => sumOfCurrentGroup += item.percentage);
                if (sumOfCurrentGroup > this.thresholdPercent) {
                    aboveThresholdGroups.push(currentGroup);
                    currentGroup = [];
                }
            }
            if (currentGroup.length > 0) {
                aboveThresholdGroups.push(currentGroup);
                currentGroup = [];
            }
            for (let i = aboveThresholdGroups.length - 1; i >= 0; i--) {
                // // console.log(i, aboveThresholdGroups);
                const thisGroup = aboveThresholdGroups[i];
                let groupSum = 0;
                thisGroup.forEach(groupItem => groupSum += groupItem.percentage);
                if (groupSum < this.thresholdPercent) {
                    if (i > 1) {
                        thisGroup.forEach(item => {
                            aboveThresholdGroups[i - 1].push({
                                itemIndex: item.itemIndex,
                                percentage: item.percentage
                            });
                        });
                        // console.log("SPLICE!")
                        aboveThresholdGroups.splice(i, 1);
                        // console.log(aboveThresholdGroups);
                    }
                }
            }
            const returnGroup = aboveThresholdGroups[aboveThresholdGroups.length - 1].sort((item1, item2) => {
                if (item1.itemIndex < item2.itemIndex) {
                    return -1;
                } else if (item1.itemIndex > item2.itemIndex) {
                    return 1;
                }
                return 0;
            });


            // console.log("RETURNING RETURN GROUP:")
            returnGroup.forEach(item => {
                // console.log("   " + item.itemIndex + " : " + item.percentage + " %");
            })

            return returnGroup;
        } else {
            // console.log('Error with getting next items');
            return [];
        }
    }

    private _remainingItemsPassThreshold(remainingItems: ActivityTreemapDataItem[]): boolean {
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
