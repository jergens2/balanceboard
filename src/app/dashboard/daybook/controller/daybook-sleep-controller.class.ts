import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { TimeUtilities } from '../../../shared/utilities/time-utilities/time-utilities';
import { TimeSchedule } from '../../../shared/utilities/time-utilities/time-schedule.class';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { SleepEntryItem } from '../widgets/timelog/sleep-entry-form/sleep-entry-item.class';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';

export class DaybookSleepController extends TimeSchedule<SleepEntryItem> {


    private _dateYYYYMMDD: string;
    private _awakeToAsleepRatio: number = 2
    private _wakeupTimeIsSet = false;


    private _firstWakeupTime: moment.Moment;
    private _fallAsleepTime: moment.Moment;

    private _prevDayDBval: DaybookSleepInputDataItem[];
    private _thisDayDBval: DaybookSleepInputDataItem[];
    private _nextDayDBval: DaybookSleepInputDataItem[];

    private _sleepTimesUpdated$: Subject<DaybookSleepInputDataItem[]> = new Subject();

    private _sleepEntryItems: SleepEntryItem[] = [];

    constructor(prevDayTimeSpanItems: DaybookSleepInputDataItem[], thisDayTimeSpanItems: DaybookSleepInputDataItem[], nextDayTimeSpanItems: DaybookSleepInputDataItem[],
        dateYYYYMMDD: string) {

        super(moment(dateYYYYMMDD).startOf('day').subtract(1, 'day'), moment(dateYYYYMMDD).startOf('day').add(2, 'days'));
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._prevDayDBval = prevDayTimeSpanItems;
        this._thisDayDBval = thisDayTimeSpanItems;
        this._nextDayDBval = nextDayTimeSpanItems;
        this._buildSleepController(prevDayTimeSpanItems, thisDayTimeSpanItems, nextDayTimeSpanItems);
        // console.log("Sleep controller value items: ")
        // this.valueItems.forEach((item) => {
        //     console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + "   ", item.hasValue, item.value)
        // })
        // console.log("Sleep controller is built.  Wakeup time is set?  ", this.wakeupTimeIsSet, this.firstWakeupTime.format('YYYY-MM-DD hh:mm a'));
    }

    private get prevDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get thisDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).format('YYYY-MM-DD'); }
    private get nextDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }


    private get startOfPrevDay(): moment.Moment { return moment(this.prevDateYYYYMMDD).startOf('day'); }
    private get startOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day'); }
    private get endOfPrevDay(): moment.Moment { return this.startOfThisDay; }
    private get endOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    private get startOfNextDay(): moment.Moment { return this.endOfThisDay; }
    private get endOfNextDay(): moment.Moment { return moment(this.nextDateYYYYMMDD).startOf('day').add(1, 'days'); };

    public get sleepDBItems(): DaybookSleepInputDataItem[] { return [...this._prevDayDBval, ...this._thisDayDBval, ... this._nextDayDBval]; }
    public get sleepEntryItems(): SleepEntryItem[] { return this._sleepEntryItems; }

    public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }

    public get ratioAwakeHoursPerDay(): number { return (this._awakeToAsleepRatio * 24) / (this._awakeToAsleepRatio + 1); }
    public get ratioAsleepHoursPerDay(): number { return 24 - this.ratioAwakeHoursPerDay; }
    public get awakeToAsleepRatio(): number { return this._awakeToAsleepRatio; }

    public get prevDayFallAsleepTime(): moment.Moment {
        let foundItem: TimeScheduleItem<SleepEntryItem>;
        if (this.isAsleepAtTime(this.endOfPrevDay)) {
            // when fell asleep before or at midnight
            foundItem = this.fullScheduleItems
                .filter(item => item.startTime.isSameOrAfter(this.startOfPrevDay) && item.endTime.isSameOrBefore(this.endOfPrevDay))
                .sort((item1, item2) => {
                    if (item1.endTime.isAfter(item2.endTime)) { return -1; }
                    if (item1.endTime.isBefore(item2.endTime)) { return 1; }
                    return 0;
                })
                .find(item => item.hasValue === false);
            if (foundItem) {

            } else {

            }
            return foundItem.endTime;
        } else {
            // when fall asleep after midnight.
            foundItem = this.fullScheduleItems.filter(item => item.startTime.isSameOrAfter(this.endOfPrevDay))
                .find(item => item.hasValue === true);
            if (foundItem) {
                return foundItem.startTime;
            } else {
                console.log("Warning: Unable to find a previous day fallAsleep time.  returning midnight/start of day")
                return this.startOfThisDay;
            }

        }
    }

    public get firstWakeupTime(): moment.Moment { return this._firstWakeupTime; }
    public get fallAsleepTime(): moment.Moment { return this._fallAsleepTime; }


    public isAwakeAtTime(timeToCheck: moment.Moment): boolean {
        return !this.isAsleepAtTime(timeToCheck);
    }
    public isAsleepAtTime(timeToCheck: moment.Moment): boolean {
        // console.log("this._sleepSchedule: " , this._sleepSchedule)
        const foundItem = this.fullScheduleItems.find((item) => {
            return timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isSameOrBefore(item.endTime);
        });
        if (foundItem) {
            // console.log(" isAsleep at time : " + timeToCheck.format('YYYY-MM-DD hh:mm a') + "  - " ,  foundItem.hasValue)
            return foundItem.hasValue;
        } else {
            console.log('Error:  no found item');
            return;
        }
    }

    /**
     * Like checking "isAsleepAtTime()" but instead of checking a single point of time, you are checking a range from start to end
     * @param startTime 
     * @param endTime 
     */
    public getSleepScheduleItems(startTime: moment.Moment, endTime: moment.Moment): TimeScheduleItem<SleepEntryItem>[] {
        return this.getScheduleSlice(startTime, endTime);
    }
    public get sleepTimesUpdated$(): Observable<DaybookSleepInputDataItem[]> { return this._sleepTimesUpdated$.asObservable(); }

    public getSleepItem(gridItemStart, gridItemEnd): SleepEntryItem{ 
        const foundItem = this.sleepEntryItems.find((item)=>{
            return gridItemStart.isSameOrAfter(item.startTime) && gridItemEnd.isSameOrBefore(item.endTime);
        })
        return null;


    }


    public setWakeupTimeForDay(wakeupTime: moment.Moment) {
        const fallAsleepTime = TimeUtilities.roundUpToCeiling(moment(wakeupTime).add(this.ratioAwakeHoursPerDay, 'hours'), 15);
        const thisDayTimeSpanItems: SleepEntryItem[] = [];
        let startTime = this.startOfThisDay;
        // console.log("Previous day fall asleep time: " + this.prevDayFallAsleepTime.format('YYYY-MM-DD hh:mm a'))
        if (this.prevDayFallAsleepTime.isAfter(this.startOfThisDay)) {
            startTime = this.prevDayFallAsleepTime;
        }
        thisDayTimeSpanItems.push(new SleepEntryItem(startTime, wakeupTime));

        if (fallAsleepTime.isBefore(this.endOfThisDay)) {
            thisDayTimeSpanItems.push(new SleepEntryItem(fallAsleepTime, this.endOfThisDay));
        }
        console.log("Updating sleep times for thisDay: ", thisDayTimeSpanItems)
        this._sleepTimesUpdated$.next(thisDayTimeSpanItems.map(item => item.saveToDB));
    }


    private _buildSleepController(prevDayTimeSpanItems: DaybookSleepInputDataItem[], thisDayTimeSpanItems: DaybookSleepInputDataItem[], nextDayTimeSpanItems: DaybookSleepInputDataItem[]) {
        const allPositives = [...prevDayTimeSpanItems, ...thisDayTimeSpanItems, ...nextDayTimeSpanItems]
            .map(item => new SleepEntryItem(moment(item.startTimeISO), moment(item.endTimeISO)))
            .map(item => new TimeScheduleItem<SleepEntryItem>(item.startTime, item.endTime, true, item))
        // console.log("allPositives items boyo: " + allPositives.length)
        // allPositives.forEach((item) => {
        //     console.log("    " + item.startTime.format('YYYY-MM-DD hh:mm a ') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " has Value? ", item.hasValue)
        // });

        // this._checkToday(allPositives)
        this.addScheduleValueItems(allPositives);
        this._populateRemainder();

        this._setFirstWakeupTime();
        this._setFallAsleepTime();

        if (thisDayTimeSpanItems.length > 0) {
            this._wakeupTimeIsSet = true;

        }

        this._buildSleepDisplayItems();
    }

    private _buildSleepDisplayItems(){
        let sleepEntryItems: SleepEntryItem[] = [];
        
        if(this.fullScheduleItems.length > 0){
            let currentTime = moment(this.fullScheduleItems[0].startTime);
            sleepEntryItems = this.fullScheduleItems.filter(item => item.hasValue).map(item => item.value);
        }
        if(sleepEntryItems.length > 1){
            for(let i=1; i<sleepEntryItems.length; i++){
                if(sleepEntryItems[i].startTime.isSame(sleepEntryItems[i-1].endTime)){
                    sleepEntryItems[i-1].setEndTime(sleepEntryItems[i].endTime);
                    sleepEntryItems.splice(i, 1);
                    i--;
                }
            }
        }
        this._sleepEntryItems = sleepEntryItems;
    }

    private _buildThisDayDefaultSleepItems(): TimeScheduleItem<SleepEntryItem>[] {
        const now = moment();
        let wakeupTime = moment(this.startOfThisDay).add(7, 'hours').add(30, 'minutes');
        if (this.thisDateYYYYMMDD === now.format('YYYY-MM-DD')) {
            if (now.isBefore(wakeupTime)) {
                wakeupTime = TimeUtilities.roundDownToFloor(now, 15);
            }
        }
        let sleepItem1 = new SleepEntryItem(moment(this.startOfThisDay), wakeupTime);
        let sleepItem2 = new SleepEntryItem(moment(this.startOfThisDay).add(23, 'hours').add(30, 'minutes'), moment(this.endOfThisDay));
        return [
            new TimeScheduleItem<SleepEntryItem>(sleepItem1.startTime, sleepItem1.endTime, true, sleepItem1),
            new TimeScheduleItem<SleepEntryItem>(sleepItem2.startTime, sleepItem2.endTime, true, sleepItem2),
        ];
    }
    private _setOtherDayItems(thisDayItems: TimeScheduleItem<SleepEntryItem>[], direction: 'PREV' | 'NEXT'): TimeScheduleItem<SleepEntryItem>[] {
        return thisDayItems.map((item) => {
            let startTime: moment.Moment, endTime: moment.Moment;
            if (direction === 'PREV') {
                startTime = moment(item.startTime).subtract(24, 'hours')
                endTime = moment(item.endTime).subtract(24, 'hours')
            } else if (direction === 'NEXT') {
                startTime = moment(item.startTime).add(24, 'hours');
                endTime = moment(item.endTime).add(24, 'hours');
            }
            const newItem = new SleepEntryItem(startTime, endTime);
            return new TimeScheduleItem<SleepEntryItem>(newItem.startTime, newItem.endTime, true, newItem);
        });
    }
    /**
     * For the DaybookDayItems that didn't have any sleep values saved, then we need to estimate what the missing values might have approximately been.
     */
    private _populateRemainder() {
        const thisDayItems = this.valueItems.filter((item) => { return item.startTime.isSameOrAfter(this.startOfThisDay) && item.endTime.isSameOrBefore(this.endOfThisDay) })
        const prevDayItems = this.valueItems.filter((item) => { return item.startTime.isSameOrAfter(this.startOfPrevDay) && item.endTime.isSameOrBefore(this.endOfPrevDay) })
        const nextDayItems = this.valueItems.filter((item) => { return item.startTime.isSameOrAfter(this.startOfNextDay) && item.endTime.isSameOrBefore(this.endOfNextDay) })

        let thisDayNewItems: TimeScheduleItem<SleepEntryItem>[] = [];
        if (thisDayItems.length === 0) {

            if (prevDayItems.length > 0) {
                thisDayNewItems = prevDayItems.map((item) => {
                    const newSleepItem = new SleepEntryItem(moment(item.startTime).add(24, 'hours'), moment(item.endTime).add(24, 'hours'))
                    return new TimeScheduleItem<SleepEntryItem>(newSleepItem.startTime, newSleepItem.endTime, true, newSleepItem);
                });
            } else if (nextDayItems.length > 0) {
                thisDayNewItems = nextDayItems.map((item) => {
                    const newSleepItem = new SleepEntryItem(moment(item.startTime).subtract(24, 'hours'), moment(item.endTime).subtract(24, 'hours'))
                    return new TimeScheduleItem<SleepEntryItem>(newSleepItem.startTime, newSleepItem.endTime, true, newSleepItem);
                });
            } else {
                thisDayNewItems = this._buildThisDayDefaultSleepItems();
            }
            this.addScheduleValueItems(thisDayNewItems);
        } else {
            thisDayNewItems = thisDayItems;
            this.addScheduleValueItems(thisDayItems);
        }
        if (prevDayItems.length === 0) {
            let prevDayNewItems = this._setOtherDayItems(thisDayNewItems, 'PREV');
            this.addScheduleValueItems(prevDayNewItems);
        } else {
            this.addScheduleValueItems(prevDayItems);
        }
        if (nextDayItems.length === 0) {
            let nextDayNewItems = this._setOtherDayItems(thisDayNewItems, 'NEXT')
            this.addScheduleValueItems(nextDayNewItems);
        } else {
            this.addScheduleValueItems(prevDayItems)
        }
    }


    private _setFallAsleepTime() {
        const foundItem = this.fullScheduleItems
            .filter(item => item.startTime.isSameOrAfter(this.firstWakeupTime) && item.endTime.isSameOrBefore(this.endOfNextDay))
            .find(item => item.hasValue === true);
        if (foundItem) {
            this._fallAsleepTime = foundItem.startTime;
        } else {
            console.log('Error:  could not find the fallAsleepTime ');
        }
        // console.log("This.fallasleep time set to: " + this.fallAsleepTime.format('YYYY-MM-DD hh:mm a'))
    }
    private _setFirstWakeupTime() {
        let startTime = this.startOfThisDay;
        let foundWakeupTime: moment.Moment;
        // console.log("finding first wakeup time after startTIme: " + startTime.format('YYYY-MM-DD hh:mm a'))
        if (this.isAwakeAtTime(this.startOfThisDay)) {
            console.log("  we were awake at the start of the day, so we are setting it to prev day fall asleep time.")
            startTime = this.prevDayFallAsleepTime;
        }
        const foundItem = this.valueItems
            .find(item => item.startTime.isSameOrAfter(startTime) && item.endTime.isSameOrBefore(this.endOfThisDay));
        if (foundItem) {
            foundWakeupTime = moment(foundItem.endTime);
        }
        else {
            const foundItem = this.fullScheduleItems
                .filter(item => item.startTime.isSameOrAfter(startTime) && item.endTime.isSameOrBefore(this.endOfThisDay))
                .find(item => item.hasValue === false);
            if (foundItem) {
                foundWakeupTime = moment(foundItem.startTime);
            } else {
                console.log("Error.  May need to theck TimeSchedule._sort method")
            }
        }
        this._firstWakeupTime = moment(foundWakeupTime);
        // console.log("This.Wakeuptime = " + this._firstWakeupTime.format("YYYY-MM-DD hh:mm a"))
    }
}
