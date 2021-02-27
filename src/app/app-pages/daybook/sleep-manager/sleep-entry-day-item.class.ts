import { DaybookSleepInputDataItem } from "../daybook-day-item/data-items/daybook-sleep-input-data-item.interface";
import { DaybookDayItem } from "../daybook-day-item/daybook-day-item.class";
import { SleepEntryInputItem } from "./sleep-entry-input-item.class";

export class SleepEntryItem{
    /**
     * This class takes the data item from the DaybookDayItem item and converts into a useable class
     * @param dayItem
     */
    constructor(dayItem: DaybookDayItem){
        this._sleepItems = dayItem.sleepInputItems.map(item => new SleepEntryInputItem(item));
        this._dateYYYYMMDD = dayItem.dateYYYYMMDD;
        let sum = 0;
        this._sleepItems.forEach(item => sum += item.durationMs);
        this._totalSleepDurationMs = sum;
    }

    private _sleepItems: SleepEntryInputItem[] = [];
    private _dateYYYYMMDD: string = "";
    private _totalSleepDurationMs: number = 0;
    
    public get sleepItems(): SleepEntryInputItem[] { return this._sleepItems; }
    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get totalDaySleepDurationMs(): number { return this._totalSleepDurationMs; }

}