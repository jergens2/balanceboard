import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { TimeUtilities } from '../../../shared/utilities/time-utilities/time-utilities';
import { TimeSchedule } from '../../../shared/utilities/time-utilities/time-schedule.class';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { DaybookSleepEntryItem } from './items/daybook-sleep-entry-item.class';

export class DaybookSleepController extends TimeSchedule<DaybookSleepEntryItem> {


    private _dateYYYYMMDD: string;
    private _awakeToAsleepRatio: number = 2
    private _wakeupTimeIsSet = false;


    private _firstWakeupTime: moment.Moment;
    private _fallAsleepTime: moment.Moment;

    private _prevDayDBval: TimeSpanItem[];
    private _thisDayDBval: TimeSpanItem[];
    private _nextDayDBval: TimeSpanItem[];

    private _sleepTimesUpdated$: Subject<TimeSpanItem[]> = new Subject();

    constructor(prevDayTimeSpanItems: TimeSpanItem[], thisDayTimeSpanItems: TimeSpanItem[], nextDayTimeSpanItems: TimeSpanItem[],
        dateYYYYMMDD: string) {

        super(moment(dateYYYYMMDD).startOf('day').subtract(1, 'day'), moment(dateYYYYMMDD).startOf('day').add(2, 'days'));
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._prevDayDBval = prevDayTimeSpanItems;
        this._thisDayDBval = thisDayTimeSpanItems;
        this._nextDayDBval = nextDayTimeSpanItems;
        this._buildSleepController(prevDayTimeSpanItems, thisDayTimeSpanItems, nextDayTimeSpanItems);
        // this._logToConsole();
        console.log("Sleep controller value items: ")
        this.valueItems.forEach((item) => {
            console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + "   ", item.hasValue, item.value)
        })
        console.log("Sleep controller is built.  Wakeup time is set?  ", this.wakeupTimeIsSet, this.firstWakeupTime.format('YYYY-MM-DD hh:mm a'));
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

    public get sleepDBItems(): TimeSpanItem[] { return [...this._prevDayDBval, ...this._thisDayDBval, ... this._nextDayDBval]; }

    public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }

    public get ratioAwakeHoursPerDay(): number { return (this._awakeToAsleepRatio * 24) / (this._awakeToAsleepRatio + 1); }
    public get ratioAsleepHoursPerDay(): number { return 24 - this.ratioAwakeHoursPerDay; }
    public get awakeToAsleepRatio(): number { return this._awakeToAsleepRatio; }

    public get prevDayFallAsleepTime(): moment.Moment {
        let foundItem: TimeScheduleItem<DaybookSleepEntryItem>;
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
    public getSleepScheduleItems(startTime: moment.Moment, endTime: moment.Moment): TimeScheduleItem<DaybookSleepEntryItem>[] {
        return this.getScheduleSlice(startTime, endTime);
    }
    public get sleepTimesUpdated$(): Observable<TimeSpanItem[]> { return this._sleepTimesUpdated$.asObservable(); }

    public setWakeupTimeForDay(wakeupTime: moment.Moment) {
        const fallAsleepTime = TimeUtilities.roundUpToCeiling(moment(wakeupTime).add(this.ratioAwakeHoursPerDay, 'hours'), 15);
        const thisDayTimeSpanItems: TimeSpanItem[] = [];
        let startTime = this.startOfThisDay;
        // console.log("Previous day fall asleep time: " + this.prevDayFallAsleepTime.format('YYYY-MM-DD hh:mm a'))
        if (this.prevDayFallAsleepTime.isAfter(this.startOfThisDay)) {
            startTime = this.prevDayFallAsleepTime;
        }
        thisDayTimeSpanItems.push({
            startTimeISO: startTime.toISOString(),
            startTimeUtcOffset: startTime.utcOffset(),
            endTimeISO: wakeupTime.toISOString(),
            endTimeUtcOffset: wakeupTime.utcOffset(),
        });

        if (fallAsleepTime.isBefore(this.endOfThisDay)) {
            thisDayTimeSpanItems.push({
                startTimeISO: fallAsleepTime.toISOString(),
                startTimeUtcOffset: fallAsleepTime.utcOffset(),
                endTimeISO: this.endOfThisDay.toISOString(),
                endTimeUtcOffset: this.endOfThisDay.utcOffset(),
            });
        }
        console.log("Updating sleep times for thisDay: ", thisDayTimeSpanItems)
        this._sleepTimesUpdated$.next(thisDayTimeSpanItems);
    }


    private _buildSleepController(prevDayTimeSpanItems: TimeSpanItem[], thisDayTimeSpanItems: TimeSpanItem[], nextDayTimeSpanItems: TimeSpanItem[]) {
        const allPositives = [...prevDayTimeSpanItems, ...thisDayTimeSpanItems, ...nextDayTimeSpanItems]
            .map(item => new DaybookSleepEntryItem(moment(item.startTimeISO), moment(item.endTimeISO)))
            .map(item => new TimeScheduleItem<DaybookSleepEntryItem>(item.startTime, item.endTime, true, item))
        console.log("allPositives items boyo: ")
        allPositives.forEach((item) => {
            console.log("    " + item.startTime.format('YYYY-MM-DD hh:mm a ') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " has Value? ")
        })

        this.addScheduleValueItems(allPositives)
        this._populateRemainder();

        this._setFirstWakeupTime();
        this._setFallAsleepTime();
    }



    private _buildThisDayDefaultSleepItems(): TimeScheduleItem<DaybookSleepEntryItem>[] {
        let sleepItem1 = new DaybookSleepEntryItem(moment(this.startOfThisDay), moment(this.startOfThisDay).add(7, 'hours').add(30, 'minutes'));
        let sleepItem2 = new DaybookSleepEntryItem(moment(this.startOfThisDay).add(23, 'hours').add(30, 'minutes'), moment(this.endOfThisDay));
       return [
           new TimeScheduleItem<DaybookSleepEntryItem>(sleepItem1.startTime, sleepItem1.endTime, true, sleepItem1),
           new TimeScheduleItem<DaybookSleepEntryItem>(sleepItem2.startTime, sleepItem2.endTime, true, sleepItem2),
       ] 
    }
    private _setOtherDayItems(thisDayItems: TimeScheduleItem<DaybookSleepEntryItem>[], direction: 'PREV' | 'NEXT'): TimeScheduleItem<DaybookSleepEntryItem>[] {
        return thisDayItems.map((item)=>{
            let startTime: moment.Moment, endTime: moment.Moment;
            if(direction === 'PREV'){
                startTime = moment(item.startTime).subtract(24, 'hours')
                endTime = moment(item.endTime).subtract(24, 'hours')
            }else if(direction === 'NEXT'){
                startTime = moment(item.startTime).add(24, 'hours');
                endTime = moment(item.endTime).add(24, 'hours');
            }
            const newItem = new DaybookSleepEntryItem(startTime, endTime);
            return new TimeScheduleItem<DaybookSleepEntryItem>(newItem.startTime, newItem.endTime, true, newItem);
        });
    }
    /**
     * For the DaybookDayItems that didn't have any sleep values saved, then we need to estimate what the missing values might have approximately been.
     */
    private _populateRemainder() {
        const thisDayItems = this.valueItems.filter((item) => { return item.startTime.isSameOrAfter(this.startOfThisDay) && item.endTime.isSameOrBefore(this.endOfThisDay) })
        const prevDayItems = this.valueItems.filter((item) => { return item.startTime.isSameOrAfter(this.startOfPrevDay) && item.endTime.isSameOrBefore(this.endOfPrevDay) })
        const nextDayItems = this.valueItems.filter((item) => { return item.startTime.isSameOrAfter(this.startOfNextDay) && item.endTime.isSameOrBefore(this.endOfNextDay) })
        
        let thisDayNewItems: TimeScheduleItem<DaybookSleepEntryItem>[] = [];
        if(thisDayItems.length === 0){
            
            if(prevDayItems.length > 0){
                thisDayNewItems = prevDayItems.map((item) => {
                    const newSleepItem = new DaybookSleepEntryItem(moment(item.startTime).add(24, 'hours'), moment(item.endTime).add(24, 'hours'))
                    return new TimeScheduleItem<DaybookSleepEntryItem>(newSleepItem.startTime, newSleepItem.endTime, true, newSleepItem );
                });
            }else if(nextDayItems.length > 0){
                thisDayNewItems = nextDayItems.map((item) => {
                    const newSleepItem = new DaybookSleepEntryItem(moment(item.startTime).subtract(24, 'hours'), moment(item.endTime).subtract(24, 'hours'))
                    return new TimeScheduleItem<DaybookSleepEntryItem>(newSleepItem.startTime, newSleepItem.endTime, true, newSleepItem );
                });
            }else{
                thisDayNewItems = this._buildThisDayDefaultSleepItems();
                console.log("THIS DAY NOY ITEMS IS " , thisDayNewItems)
            }
            this.addScheduleValueItems(thisDayNewItems);
        }else{
            thisDayNewItems = thisDayItems;
            this.addScheduleValueItems(thisDayItems);
        }
        if(prevDayItems.length === 0){
            let prevDayNewItems = this._setOtherDayItems(thisDayNewItems, 'PREV');
            this.addScheduleValueItems(prevDayNewItems);
        }else{
            this.addScheduleValueItems(prevDayItems);
        }
        if(nextDayItems.length === 0){
            let nextDayNewItems = this._setOtherDayItems(thisDayNewItems, 'NEXT')
            this.addScheduleValueItems(nextDayNewItems);
        }else{
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
        console.log("This.fallasleep time set to: " + this.fallAsleepTime.format('YYYY-MM-DD hh:mm a'))
    }
    private _setFirstWakeupTime() {
        let startTime = this.startOfThisDay;
        // console.log("finding first wakeup time after startTIme: " + startTime.format('YYYY-MM-DD hh:mm a'))
        if (this.isAwakeAtTime(this.startOfThisDay)) {
            console.log("  we were awake at the start of the day, so we are setting it to prev day fall asleep time.")
            startTime = this.prevDayFallAsleepTime;
        }
        const foundItem = this.valueItems
            .find(item => item.startTime.isSameOrAfter(startTime) && item.endTime.isSameOrBefore(this.endOfThisDay));
        if (foundItem) {
            this._firstWakeupTime = foundItem.endTime;
        }
        else {
            const foundItem = this.fullScheduleItems
                .filter(item => item.startTime.isSameOrAfter(startTime) && item.endTime.isSameOrBefore(this.endOfThisDay))
                .find(item => item.hasValue === false);
            if (foundItem) {
                this._firstWakeupTime = foundItem.startTime;
            } else {
                console.log("Error.  May need to theck TimeSchedule._sort method")
            }
        }
        console.log("This.Wakeuptime = " + this._firstWakeupTime.format("YYYY-MM-DD hh:mm a"))
    }
}
