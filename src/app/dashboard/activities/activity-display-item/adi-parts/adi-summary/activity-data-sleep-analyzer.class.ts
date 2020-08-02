import { DaybookDayItem } from "../../../../daybook/api/daybook-day-item.class";
import { DaybookSleepInputDataItem } from "../../../../daybook/api/data-items/daybook-sleep-input-data-item.interface";
import { SleepEntryItem } from "../../../../daybook/sleep-manager/sleep-entry-day-item.class";

export class ActivityDataSleepAnalyzer{

    private _sleepItems: SleepEntryItem[] = [];




    constructor(daybookDayItems: DaybookDayItem[]){
        this._sleepItems = daybookDayItems.map(dItem => new SleepEntryItem(dItem));
        
    }






}