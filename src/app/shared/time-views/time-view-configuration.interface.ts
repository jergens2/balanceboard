import { TimeViewDayData } from "./time-view-day-data-interface";

export interface TimeViewConfiguration{
    units: string;
    minValue: number;
    maxValue: number;
    singleValueType: boolean;
    data: TimeViewDayData[];
}