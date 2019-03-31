import { DayTemplate } from "./day-template.model";

export interface IDayTemplateItem{
    dayTemplate: DayTemplate;
    dayOfRotation: number;  //not zero-based; 1, 2, 3, 4, 5, 6, 7 ...
    date: string; //YYYY-MM-DD
}