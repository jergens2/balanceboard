import { DaybookDayItem } from "../../../../daybook/daybook-day-item/daybook-day-item.class";
import { DaybookSleepInputDataItem } from "../../../../daybook/daybook-day-item/data-items/daybook-sleep-input-data-item.interface";
import { SleepEntryItem } from "../../../../daybook/sleep-manager/sleep-entry-day-item.class";

export class ActivityDataSleepAnalyzer{

    private _sleepItems: SleepEntryItem[] = [];




    constructor(daybookDayItems: DaybookDayItem[]){
        this._sleepItems = daybookDayItems.map(dItem => new SleepEntryItem(dItem));
        
    }






}