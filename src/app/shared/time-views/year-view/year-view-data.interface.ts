import { YearViewDataType } from "./year-view-data-type.enum";

export interface YearViewData{
    dataType: YearViewDataType;
    data: { dateYYYYMMDD: string, value: number}[];
    maxValue: number;
    options: any;
}