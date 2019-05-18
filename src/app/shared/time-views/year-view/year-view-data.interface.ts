import { YearViewDataType } from "./year-view-data-type.enum";

export interface IYearViewData{
    dataType: YearViewDataType;
    data: { dateYYYYMMDD: string, value: number}[];
    maxValue: number;
    options: any;
}