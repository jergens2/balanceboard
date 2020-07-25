import { DaybookDayItem } from "../../../../daybook/api/daybook-day-item.class";

export class ActivityDataAnalyzer{

    private _daybookItems: DaybookDayItem[] = [];
    constructor(daybookItems: DaybookDayItem[]){
        this._daybookItems = daybookItems;
    }

    public get daybookItems(): DaybookDayItem[] { return this._daybookItems; }
}