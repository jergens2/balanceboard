import { TimeInput } from '../../../../shared/components/time-input/time-input.class';
import { DaybookDayItem } from '../../daybook-day-item/daybook-day-item.class';
import { DaybookTimeScheduleItem } from '../../display-manager/daybook-time-schedule/daybook-time-schedule-item.class';
import { SleepManager } from '../../sleep-manager/sleep-manager.class';
import * as moment from 'moment';

export class SleepDisplayProfile {

    private _wakeupTime: moment.Moment;
    private _fallAsleepTime: moment.Moment;

    private _wakeupInput: TimeInput;
    private _fallAsleepInput: TimeInput;

    public get wakeupInput(): TimeInput { return this._wakeupInput; }
    public get fallAsleepInput(): TimeInput { return this._fallAsleepInput; }
    public get wakeupTime(): moment.Moment { return this._wakeupTime; }
    public get fallAsleepTime(): moment.Moment { return this._fallAsleepTime; }

    constructor(scheduleItems: DaybookTimeScheduleItem[], sleepManager: SleepManager, dateYYYYMMDD: string, dayItems: DaybookDayItem[]) {
        this._wakeupTime = sleepManager.findPreviousWakeupTimeForDate(dateYYYYMMDD, dayItems);
        this._fallAsleepTime = sleepManager.findNextFallAsleepTimeForDate(dateYYYYMMDD, dayItems);
        // console.log("WAKEUPTIME : " + this._wakeupTime.format('YYYY-MM-DD hh:mm a'))
        // console.log("items: " )
        // scheduleItems.forEach(item => console.log("   " + item.toString()))
        const wakeupItem = scheduleItems.find(item => item.schedItemEndTime.isSame(this._wakeupTime));
        const sleepItem = scheduleItems.find(item => item.schedItemStartTime.isSame(this._fallAsleepTime));
        // console.log("WAKE UP ITEM, SLEEP ITEM: " , wakeupItem, sleepItem)
        this._wakeupInput = wakeupItem.timeLimiter.clone().endTimeInput;
        this._fallAsleepInput = sleepItem.timeLimiter.clone().startTimeInput;
    }
}
