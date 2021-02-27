import * as moment from 'moment';
import { DaybookDayItem } from '../../../daybook-day-item/daybook-day-item.class';
import { DaybookSleepInputDataItem } from '../../../daybook-day-item/data-items/daybook-sleep-input-data-item.interface';
import { UserAccountProfile } from '../../../../user-account-profile/api/user-account-profile.class';
import { SleepDataForm } from './sleep-data-form.class';
import { TimelogEntryItem } from '../../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

export class SleepDaybookItemUpdater {


    /**
     * This class exists for the sleep service to take the data from the sleepCycleData
     *  and create the appropriate entries in the DaybookDayItems where they are saved.
     * 
     * the daybookHTTP service is provided on construction.
     * The daybookHTTP service should have already been loaded and have items.
     */
    constructor() {
    }

    public updateDaybookItemsForSleepForm(sleepForm: SleepDataForm,
        userProfile: UserAccountProfile, dayItems: DaybookDayItem[],
        addTimelogEntries: TimelogEntryItem[]): DaybookDayItem[] {
        const thisDateYYYYMMDD: string = moment().format('YYYY-MM-DD');
        const prevDateYYYYMMDD: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
        const prevDayItem = dayItems.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD);
        const thisDayItem = dayItems.find(item => item.dateYYYYMMDD === thisDateYYYYMMDD);

        if (!(prevDayItem && thisDayItem)) {
            console.log('Error:  no daybookDayItems found.');
        } else {

            const prevFallAsleepTime: string = sleepForm.previousFallAsleepTime.toISOString();
            const prevFallAsleepUTCOffset: number = sleepForm.previousFallAsleepTime.utcOffset();
            const previousWakeupTime: string = sleepForm.previousWakeupTime.toISOString();
            const previousWakeupUTCOffset: number = sleepForm.previousWakeupTime.utcOffset();
            const energyAtWakeup: number = sleepForm.energyAtWakeup;
            const nextFallAsleepTime: string = sleepForm.nextFallAsleepTime.toISOString();
            const nextFallAsleepTimeUTCOffset: number = sleepForm.nextFallAsleepTime.utcOffset();
            const nextWakeupTime: string = sleepForm.nextWakeupTime.toISOString();
            const nextWakeupUTCOffset: number = sleepForm.nextWakeupTime.utcOffset();
            const durationPercent: number = sleepForm.sleepDurationPercent;

            const prevDaySleepItems: DaybookSleepInputDataItem[] = Object.assign([], prevDayItem.sleepInputItems);
            const startOfThisDay = moment().startOf('day');
            const yesterDateYYYYMMDD: string = moment().startOf('day').subtract(24, 'hours').format('YYYY-MM-DD');

            // console.log(' TO DO:  verify that when saving new sleep items, that there is no overlapping / duplication.')
            if (prevDaySleepItems.length === 0) {
                const yesterdayDefaultWakeup = userProfile.defaultWakeupTime(yesterDateYYYYMMDD);
                prevDaySleepItems.push(this._newSleepItem(moment(yesterDateYYYYMMDD).startOf('day'), moment(yesterdayDefaultWakeup)));
            }
            const thisDaySleepItems: DaybookSleepInputDataItem[] = [];

            if (moment(prevFallAsleepTime).isBefore(startOfThisDay)) {
                const startTime = moment(prevFallAsleepTime);
                let endTime = moment(startOfThisDay);
                if (moment(previousWakeupTime).isBefore(startOfThisDay)) {
                    endTime = moment(previousWakeupTime);
                } else if (moment(previousWakeupTime).isAfter(startOfThisDay)) {
                    thisDaySleepItems.push(this._newSleepItem(startOfThisDay, moment(previousWakeupTime), durationPercent, energyAtWakeup));
                }
                prevDaySleepItems.push(this._newSleepItem(startTime, endTime));
            } else if (moment(prevFallAsleepTime).isAfter(startOfThisDay)) {
                const newItem = this._newSleepItem(moment(prevFallAsleepTime), moment(previousWakeupTime), durationPercent, energyAtWakeup);
                thisDaySleepItems.push(newItem);
            }
            prevDayItem.sleepInputItems = this._validateSleepItems(prevDaySleepItems);
            thisDayItem.sleepInputItems = this._validateSleepItems(thisDaySleepItems);
            if (addTimelogEntries.length > 0) {
                addTimelogEntries.forEach(item => {
                    if (item.startTime.format('YYYY-MM-DD') === prevDateYYYYMMDD) {
                        prevDayItem.timelogEntryDataItems.push(item.toDataEntryItem());
                    } else if (item.startTime.format('YYYY-MM-DD') === thisDateYYYYMMDD) {
                        thisDayItem.timelogEntryDataItems.push(item.toDataEntryItem());
                    }
                });
            }
            const daysToUpdate = [prevDayItem, thisDayItem];
            // console.log("DAYS TO UPDATE: ", daysToUpdate)
            return daysToUpdate;
        }
        return [];
    }


    public changeWakeupTime(dateYYYYMMDD: string, currentValue: moment.Moment,
        newValue: moment.Moment, dayItems: DaybookDayItem[]): DaybookDayItem[] {
        const thisDateYYYYMMDD: string = moment(dateYYYYMMDD).format('YYYY-MM-DD');
        const prevDateYYYYMMDD: string = moment(dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
        const prevDayItem = dayItems.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD);
        const thisDayItem = dayItems.find(item => item.dateYYYYMMDD === thisDateYYYYMMDD);
        const startOfThisDay = moment(dateYYYYMMDD).startOf('day');
        const endOfThisDay = moment(dateYYYYMMDD).add(1, 'days').startOf('day');

        const sleepItemThisDay = thisDayItem.sleepInputItems.find(item => moment(item.endSleepTimeISO).isSame(currentValue));
        const sleepItemPrevDay = prevDayItem.sleepInputItems.find(item => moment(item.endSleepTimeISO).isSame(currentValue));

        const newTimeIsThisDay: boolean = newValue.isAfter(startOfThisDay);

        // console.log("changeWakeupTime("+newValue.format('YYYY-MM-DD hh:mm a')+"): Day items before update:")
        // console.log("CURRENT VAL IS: " + currentValue.format('YYYY-MM-DD hh:mm a'));
        // dayItems.forEach(item => {
        //     console.log("ITEM: " + item.dateYYYYMMDD)
        //     item.sleepInputItems.forEach(si => console.log("    " 
        //     + moment(si.startSleepTimeISO).format('YYYY-MM-DD hh:mm a') + " to " + moment(si.endSleepTimeISO).format('YYYY-MM-DD hh:mm a')))
        // })

        if (sleepItemThisDay) {
            console.log("SLEEP ITEM THIS DAY: , ", sleepItemThisDay)
            if (newTimeIsThisDay) {
                sleepItemThisDay.endSleepTimeISO = moment(newValue).toISOString();
                sleepItemThisDay.endSleepTimeUtcOffsetMinutes = moment(newValue).utcOffset();
            } else {
                thisDayItem.sleepInputItems.splice(thisDayItem.sleepInputItems.indexOf(sleepItemThisDay), 1);
                const foundPrev = prevDayItem.sleepInputItems.find(item => item.endSleepTimeISO === moment(endOfThisDay).toISOString());
                if (foundPrev) {
                    foundPrev.endSleepTimeISO = moment(newValue).toISOString();
                    foundPrev.endSleepTimeUtcOffsetMinutes = moment(newValue).utcOffset();
                }
            }
        } else if (sleepItemPrevDay) {
            if (newTimeIsThisDay) {
                sleepItemPrevDay.endSleepTimeISO = moment(startOfThisDay).toISOString();
                sleepItemPrevDay.endSleepTimeUtcOffsetMinutes = moment(startOfThisDay).utcOffset();
                const newSleepItem: DaybookSleepInputDataItem = {
                    startSleepTimeISO: moment(startOfThisDay).toISOString(),
                    startSleepTimeUtcOffsetMinutes: moment(startOfThisDay).utcOffset(),
                    endSleepTimeISO: moment(newValue).toISOString(),
                    endSleepTimeUtcOffsetMinutes: moment(newValue).utcOffset(),
                    percentAsleep: 100,
                    embeddedNote: '',
                    activities: [],
                    energyAtEnd: 100,
                };
                thisDayItem.sleepInputItems.push(newSleepItem);
            } else {
                sleepItemPrevDay.endSleepTimeISO = moment(newValue).toISOString();
                sleepItemPrevDay.endSleepTimeUtcOffsetMinutes = moment(newValue).utcOffset();
            }
        }
        // console.log("changeWakeupTime(): Day items after update:")
        // dayItems.forEach(item => {
        //     console.log("ITEM: " + item.dateYYYYMMDD)
        //     item.sleepInputItems.forEach(si => console.log("    " 
        //     + moment(si.startSleepTimeISO).format('YYYY-MM-DD hh:mm a') + " to " + moment(si.endSleepTimeISO).format('YYYY-MM-DD hh:mm a')))
        // })
        return dayItems;
    }

    public changeFallAsleepTime(dateYYYYMMDD: string,
        currentValue: moment.Moment, newValue: moment.Moment, dayItems: DaybookDayItem[]): DaybookDayItem[] {

        // console.log("changeFallAsleepTime(): Day items before update:")
        // dayItems.forEach(item => {
        //     console.log("ITEM: " + item.dateYYYYMMDD)
        //     item.sleepInputItems.forEach(si => console.log("    " 
        //     + moment(si.startSleepTimeISO).format('YYYY-MM-DD hh:mm a') + " to " + moment(si.endSleepTimeISO).format('YYYY-MM-DD hh:mm a')))
        // })
        const thisDateYYYYMMDD: string = moment(dateYYYYMMDD).format('YYYY-MM-DD');
        const prevDateYYYYMMDD: string = moment(dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
        const nextDateYYYYMMDD: string = moment(dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        const prevDayItem = dayItems.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD);
        const thisDayItem = dayItems.find(item => item.dateYYYYMMDD === thisDateYYYYMMDD);
        const nextDayItem = dayItems.find(item => item.dateYYYYMMDD === nextDateYYYYMMDD);
        const startOfThisDay = moment(dateYYYYMMDD).startOf('day');
        const endOfThisDay = moment(dateYYYYMMDD).add(1, 'days').startOf('day');

        const sleepItemThisDay = thisDayItem.sleepInputItems.find(item => moment(item.startSleepTimeISO).isSame(currentValue));
        const sleepItemNextDay = nextDayItem.sleepInputItems.find(item => moment(item.startSleepTimeISO).isSame(currentValue));
        const newTimeIsThisDay: boolean = newValue.isAfter(startOfThisDay);
        if (sleepItemThisDay) {
            if (newTimeIsThisDay) {
                sleepItemThisDay.startSleepTimeISO = moment(newValue).toISOString();
                sleepItemThisDay.startSleepTimeUtcOffsetMinutes = moment(newValue).utcOffset();
            } else {
                thisDayItem.sleepInputItems.splice(thisDayItem.sleepInputItems.indexOf(sleepItemThisDay), 1);
                const foundNext = nextDayItem.sleepInputItems.find(item => item.startSleepTimeISO === moment(endOfThisDay).toISOString());
                if (foundNext) {
                    foundNext.startSleepTimeISO = moment(newValue).toISOString();
                    foundNext.startSleepTimeUtcOffsetMinutes = moment(newValue).utcOffset();
                }
            }
        } else if (sleepItemNextDay) {
            if (newTimeIsThisDay) {
                sleepItemNextDay.startSleepTimeISO = moment(endOfThisDay).toISOString();
                sleepItemNextDay.startSleepTimeUtcOffsetMinutes = moment(endOfThisDay).utcOffset();
                const newSleepItem: DaybookSleepInputDataItem = {
                    startSleepTimeISO: moment(newValue).toISOString(),
                    startSleepTimeUtcOffsetMinutes: moment(newValue).utcOffset(),
                    endSleepTimeISO: moment(endOfThisDay).toISOString(),
                    endSleepTimeUtcOffsetMinutes: moment(endOfThisDay).utcOffset(),
                    percentAsleep: 100,
                    embeddedNote: '',
                    activities: [],
                    energyAtEnd: 100,
                };
                thisDayItem.sleepInputItems.push(newSleepItem);
            } else {
                sleepItemNextDay.startSleepTimeISO = moment(newValue).toISOString();
                sleepItemNextDay.startSleepTimeUtcOffsetMinutes = moment(newValue).utcOffset();
            }
        }
        dayItems.forEach(item => item.sleepInputItems = this._validateSleepItems(item.sleepInputItems));
        // console.log("changeFallAsleepTime(): Day items after update:")
        // dayItems.forEach(item => {
        //     console.log("ITEM: " + item.dateYYYYMMDD)
        //     item.sleepInputItems.forEach(si => console.log("    " 
        //     + moment(si.startSleepTimeISO).format('YYYY-MM-DD hh:mm a') + " to " + moment(si.endSleepTimeISO).format('YYYY-MM-DD hh:mm a')))
        // })
        return dayItems;
    }


    private _validateSleepItems(sleepItems: DaybookSleepInputDataItem[]): DaybookSleepInputDataItem[] {
        sleepItems = sleepItems.sort((item1, item2) => {
            if (item1.startSleepTimeISO < item2.startSleepTimeISO) { return -1; }
            else if (item1.startSleepTimeISO > item2.startSleepTimeISO) { return 1; }
            else return 0;
        });
        if (sleepItems.length > 0) {
            for (let i = 1; i < sleepItems.length; i++) {
                let errorItem: boolean = false;
                if (sleepItems[i].startSleepTimeISO === sleepItems[i - 1].startSleepTimeISO) {
                    errorItem = true;
                } else if (sleepItems[i].startSleepTimeISO < sleepItems[i - 1].endSleepTimeISO) {
                    errorItem = true;
                }
                if (errorItem) {
                    console.log('Warning:  error with input items.  rectifiying')
                    sleepItems.splice(i, 1);
                    i--;
                }
            }
        }
        return sleepItems;
    }

    private _newSleepItem(startTime: moment.Moment, endTime: moment.Moment, duration = 100, energy = 100): DaybookSleepInputDataItem {
        return {
            startSleepTimeISO: moment(startTime).toISOString(),
            startSleepTimeUtcOffsetMinutes: startTime.utcOffset(),
            endSleepTimeISO: moment(endTime).toISOString(),
            endSleepTimeUtcOffsetMinutes: endTime.utcOffset(),
            percentAsleep: duration,
            embeddedNote: '',
            activities: [],
            energyAtEnd: energy,
        };
    }
}
