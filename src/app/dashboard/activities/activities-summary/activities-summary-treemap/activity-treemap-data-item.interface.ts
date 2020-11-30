import { ActivityCategoryDefinition } from "../../api/activity-category-definition.class";

export interface ActivityTreemapDataItem {
    totalChartMs: number;
    totalBranchMs: number;
    percentOfTotal: number;
    percentOfParent: number;

    width: number;
    height: number;

    nodeActivity: ActivityCategoryDefinition;
    nodeActivityMs: number;

    gridTemplateRows: string;
    gridTemplateColumns: string;

    childItems: ActivityTreemapDataItem[];
}
