import * as moment from 'moment';
import { DaybookDayItem } from '../../../daybook-day-item/daybook-day-item.class';
import { DaybookSleepInputDataItem } from '../../../daybook-day-item/data-items/daybook-sleep-input-data-item.interface';
import { UserAccountProfile } from '../../../../user-account-profile/api/user-account-profile.class';
import { SleepDataForm } from './sleep-data-form.class';

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

    public updateDaybookItems(sleepForm: SleepDataForm,
        userProfile: UserAccountProfile, dayItems: DaybookDayItem[]): DaybookDayItem[] {
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

            console.log(' TO DO:  verify that when saving new sleep items, that there is no overlapping / duplication.')
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
            const daysToUpdate = [prevDayItem, thisDayItem];
            return daysToUpdate;
            // forkJoin(daysToUpdate.map<Observable<DaybookDayItem>>((item: DaybookDayItem) =>
            //     this._httpService.updateDaybookDayItem$(item)))
            //     .subscribe((updatedItems: DaybookDayItem[]) => {
            //         // console.log("Received updated items from forkJoin: ", updatedItems);
            //         isComplete$.next(true);
            //     }, (err) => {
            //         console.log('error updating day items: ', err);
            //         isComplete$.next(true);
            //     });
            // return isComplete$.asObservable();
        }
        return [];
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
