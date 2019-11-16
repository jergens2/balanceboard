import { DaybookDayItemTimelog } from './daybook-day-item-timelog.class';
import { DaybookSleepProfile } from './daybook-sleep-profile.class';
import { Subject, Observable, BehaviorSubject, Subscription, timer } from 'rxjs';
import * as moment from 'moment';
import { DaybookTimelogEntryDataItem } from '../data-items/daybook-timelog-entry-data-item.interface';
import { DaybookDayItemSleepProfileData } from '../data-items/daybook-day-item-sleep-profile-data.interface';
import { RoundToNearestMinute } from '../../../../shared/utilities/time-utilities/round-to-nearest-minute.class';
import { StatusAtTime } from './status-at-time.interface';
import { ReferencerTimeEventName } from './referencer-time-event-name.enum';
import { StatusTimes } from './status-times.class';

export class DaybookTimeReferencer {
    /**
     * This class takes the completed SleepProfile and Timelog classes and puts them together
     * for the purpose of being able to make determinations about the time
     */
    constructor(timelog: DaybookDayItemTimelog, sleepProfile: DaybookSleepProfile, dateYYYYMMDD: string) {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._timelog = timelog;
        this._sleepProfile = sleepProfile;
        this._startClock();
        this._recalculate();
    }


    private _dateYYYYMMDD: string;
    private _timelog: DaybookDayItemTimelog;
    private _sleepProfile: DaybookSleepProfile;

    private _previousTimelog: DaybookDayItemTimelog;
    private _previousSleepProfile: DaybookSleepProfile;

    private _followingTimelog: DaybookDayItemTimelog;
    private _followingSleepProfile: DaybookSleepProfile;

    private _previousDataChanged = false;
    private _followingDataChanged = false;

    private _statusTimes: StatusTimes;

    private _dataChanged$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _changeSubscriptions: Subscription[] = [];

    private _now: moment.Moment;
    private _clockTimerSubscription: Subscription = new Subscription();
    private _startClock() {
        this._clockTimerSubscription.unsubscribe();
        this._clockTimerSubscription = timer(0, 1000).subscribe((tick) => {
            this._now = moment();
        });
    }

    public get now(): moment.Moment { return moment(this._now); }
    public get activeDayIsToday(): boolean { return this._statusTimes.activeDayIsToday; }

    public get previousSleepProfile(): DaybookSleepProfile { return this._previousSleepProfile; }
    public get followingSleepProfile(): DaybookSleepProfile { return this._followingSleepProfile; }

    public get previousDataChanged(): boolean { return this._previousDataChanged; }
    public get followingDataChanged(): boolean { return this._followingDataChanged; }

    public get daybookTimelogEntryDataItems(): DaybookTimelogEntryDataItem[] {
        return this._timelog.timelogEntryItems.map(item => item.dataEntryItem);
    }
    public get timeDelineators(): string[] { return this._timelog.timeDelineators; }
    public get sleepProfileData(): DaybookDayItemSleepProfileData { return this._sleepProfile.sleepProfileData; }

    public get statusTimes(): StatusTimes {
        return this._statusTimes;
    }


    /**
     * This method is only for use by the Today daybook day item.
     */
    public getNewTimelogEntryTemplate(): {
        startTime: moment.Moment,
        startTimeStartBoundary: moment.Moment,
        startTimeEndBoundary: moment.Moment,
        setSleepProfileRequired: boolean,
        crossesMidnight: boolean,
        isAmbiguous: boolean,
    } {
        // console.log("Finish this method")
        const now: moment.Moment = moment();
        if (this.activeDayIsToday) {
            const isAfterWakeup = now.isSameOrAfter(this.thisDayWakeupTime.startTime);
            const isBeforeBedTime = now.isSameOrBefore(this.thisDayBedTime.startTime);
            if (isAfterWakeup && isBeforeBedTime) {
                return this._standardTimelogEntry();
            } else if (now.isBefore(this.thisDayWakeupTime.startTime)) {
                return this._beforeWakeupTimelogEntry();
            } else if (now.isAfter(this.thisDayBedTime.startTime)) {
                return this._standardTimelogEntry();
            }
        } else {
            console.log("Error:  this method is only for the Today daybook day.");
        }
        return null;
    }

    private _standardTimelogEntry(): {
        startTime: moment.Moment,
        startTimeStartBoundary: moment.Moment,
        startTimeEndBoundary: moment.Moment,
        setSleepProfileRequired: boolean,
        crossesMidnight: boolean,
        isAmbiguous: boolean,
    } {
        let startTimeStartBoundary: moment.Moment = this.getThisDayLastActivityTime();
        if (this.thisDayWakeupTime.startTime.isAfter(startTimeStartBoundary)) {
            startTimeStartBoundary = this.thisDayWakeupTime.startTime;
        }
        return {
            startTime: startTimeStartBoundary,
            startTimeStartBoundary: startTimeStartBoundary,
            startTimeEndBoundary: moment(),
            setSleepProfileRequired: !this.thisDayWakeupTime.isSet,
            crossesMidnight: false,
            isAmbiguous: false,
        };
    }
    private _beforeWakeupTimelogEntry(): {
        startTime: moment.Moment,
        startTimeStartBoundary: moment.Moment,
        startTimeEndBoundary: moment.Moment,
        setSleepProfileRequired: boolean,
        crossesMidnight: boolean,
        isAmbiguous: boolean,
    } {

        let isAmbiguous: boolean = false;
        let crossesMidnight: boolean = false;
        let setSleepProfileRequired = false;
        let startTimeEndBoundary: moment.Moment = moment();
        let startTimeStartBoundary = this.previousDayBedTime.startTime;
        if (this.getPreviousDayLastActivityTime().isAfter(startTimeStartBoundary)) {
            startTimeStartBoundary = this.getPreviousDayLastActivityTime();
        }
        if (startTimeStartBoundary.isBefore(this.startOfThisDay)) {
            crossesMidnight = true;
        } else {
            const now = moment();

            const totalMs: number = this.thisDayWakeupTime.startTime.diff(startTimeStartBoundary, 'milliseconds');

            const isCloseToStartBoundary: boolean =
                now.isSameOrAfter(startTimeStartBoundary) &&
                now.isSameOrBefore(moment(startTimeStartBoundary).add((0.25 * totalMs), 'milliseconds'));
            const isCloseToWakeup: boolean =
                now.isSameOrBefore(this.thisDayWakeupTime.startTime) &&
                now.isSameOrAfter(moment(this.thisDayWakeupTime.startTime).subtract((0.25 * totalMs), 'milliseconds'));

            if (now.isSameOrAfter(startTimeStartBoundary) && now.isSameOrBefore(this.thisDayWakeupTime.startTime)) {
                if (isCloseToStartBoundary) {
                    setSleepProfileRequired = false;
                } else if (isCloseToWakeup) {
                    setSleepProfileRequired = true;
                } else {
                    isAmbiguous = true;
                }
            } else {
                console.log("error with now time");
            }
        }
        return {
            startTime: startTimeStartBoundary,
            startTimeStartBoundary: startTimeStartBoundary,
            startTimeEndBoundary: startTimeEndBoundary,
            setSleepProfileRequired: setSleepProfileRequired,
            crossesMidnight: crossesMidnight,
            isAmbiguous: isAmbiguous,
        };
    }



    public addPreviousDateInfo(prevTimelog: DaybookDayItemTimelog, prevSleepProfile: DaybookSleepProfile) {
        this._previousTimelog = prevTimelog;
        this._previousSleepProfile = prevSleepProfile;
        this._recalculate();
    }
    public addFollowingDateInfo(followingTimelog: DaybookDayItemTimelog, followingSleepProfile: DaybookSleepProfile) {
        this._followingTimelog = followingTimelog;
        this._followingSleepProfile = followingSleepProfile;
        this._recalculate();
    }


    public get dataChanged$(): Observable<boolean> { return this._dataChanged$.asObservable(); }

    public get previousDayWakeupTime(): StatusAtTime { return this._statusTimes.previousDayWakeupTime; }
    public get previousDayBedTime(): StatusAtTime { return this._statusTimes.previousDayBedTime; }

    public get thisDayWakeupTime(): StatusAtTime { return this._statusTimes.thisDayWakeupTime; }
    public get thisDayBedTime(): StatusAtTime { return this._statusTimes.thisDayBedTime; }

    public get followingDayWakeupTime(): StatusAtTime { return this._statusTimes.followingDayWakeupTime; }
    public get followingDayBedTime(): StatusAtTime { return this._statusTimes.followingDayBedTime; }

    public get wakeupTimeMin(): moment.Moment { return this._statusTimes.wakeupTimeMin; }
    public get wakeupTimeMax(): moment.Moment { return this._statusTimes.wakeupTimeMax; }

    public get bedTimeMin(): moment.Moment { return this._statusTimes.bedTimeMin; }
    public get bedTimeMax(): moment.Moment { return this._statusTimes.bedTimeMax; }

    public get startOfPreviousDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').subtract(24, 'hours'); }
    public get startOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day'); }
    public get startOfNextDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    public get endOfNextDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(48, 'hours'); }

    public getThisDayLastActivityTime(): moment.Moment { return this._timelog.lastTimelogEntryItemTime; }
    public getPreviousDayLastActivityTime(): moment.Moment {
        if (this._previousTimelog) {
            return this._previousTimelog.lastTimelogEntryItemTime;
        } else {
            return this.startOfPreviousDay;
        }
    }
    public getFollowingDayLastActivityTime(): moment.Moment {
        if (this._followingTimelog) {
            return this._followingTimelog.lastTimelogEntryItemTime;
        } else {
            return this.startOfNextDay;
        }
    }



    private _recalculate() {
        // console.log(this._dateYYYYMMDD + "  Time referencer.recalculating()")
        let sleepStatusTimes: StatusAtTime[] = [];
        sleepStatusTimes.push({
            startTime: this.startOfPreviousDay,
            endTime: this.startOfPreviousDay,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.StartOfPreviousDay
        });
        sleepStatusTimes.push({
            startTime: this.startOfThisDay,
            endTime: this.startOfThisDay,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.StartOfThisDay
        });
        sleepStatusTimes.push({
            startTime: this.startOfNextDay,
            endTime: this.startOfNextDay,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.StartOfNextDay
        });
        sleepStatusTimes.push({
            startTime: this.endOfNextDay,
            endTime: this.endOfNextDay,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.EndOfNextDay
        });


        let activityTimes = this._timelog.activityTimes;
        if (this._followingTimelog) {
            activityTimes = activityTimes.concat(this._followingTimelog.activityTimes);
        }
        if (this._previousTimelog) {
            activityTimes = activityTimes.concat(this._previousTimelog.activityTimes);
        }



        let wakeupTimeStatus = {
            startTime: this._determineWakeupTime(),
            endTime: null,
            isAWake: true,
            isActive: false,
            isSet: this._sleepProfile.wakeupTimeIsSet,
            name: ReferencerTimeEventName.ThisDayWakeupTime,
        };
        sleepStatusTimes.push(wakeupTimeStatus);
        // console.log("This day wakeup time determined to be: " + wakeupTimeStatus.startTime.format("YYYY-MM-DD hh:mm a"))
        let bedTimeStatus = {
            startTime: null,
            endTime: null,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.ThisDayBedTime,
        };
        if (this._sleepProfile.bedTimeIsSet) {
            bedTimeStatus.startTime = this._sleepProfile.bedTime;
            bedTimeStatus.isSet = true;
        }
        sleepStatusTimes.push(bedTimeStatus);

        let previousWakeupTime = {
            startTime: null,
            endTime: null,
            isAWake: true,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.PreviousDayWakeupTime,
        };
        let previousBedTime = {
            startTime: null,
            endTime: null,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.PreviousDayBedTime,
        };
        let followingDayWakeupTime = {
            startTime: null,
            endTime: null,
            isAWake: true,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.FollowingDayWakeupTime,
        };
        let followingDayBedTime = {
            startTime: null,
            endTime: null,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.FollowingDayBedTime,
        };


        if (this._previousSleepProfile) {
            if (this._previousSleepProfile.wakeupTimeIsSet) {
                previousWakeupTime.startTime = this._previousSleepProfile.wakeupTime;
                previousWakeupTime.isSet = true;
            }
            if (this._previousSleepProfile.bedTimeIsSet) {
                previousBedTime.startTime = this._previousSleepProfile.bedTime;
                previousBedTime.isSet = true;
            }
        }
        if (this._followingSleepProfile) {
            if (this._followingSleepProfile.wakeupTimeIsSet) {
                followingDayWakeupTime.startTime = this._followingSleepProfile.wakeupTime;
                followingDayWakeupTime.isSet = true;
            }
            if (this._followingSleepProfile.bedTimeIsSet) {
                followingDayBedTime.startTime = this._followingSleepProfile.bedTime;
                followingDayBedTime.isSet = true;
            }
        }
        sleepStatusTimes.push(previousBedTime);
        sleepStatusTimes.push(previousWakeupTime);
        sleepStatusTimes.push(followingDayBedTime);
        sleepStatusTimes.push(followingDayWakeupTime);

        // console.log("CONSTRUCTING STATUS TIMES:  " + this._dateYYYYMMDD);
        this._statusTimes = new StatusTimes(sleepStatusTimes, this._dateYYYYMMDD);
        this._updateChangeSubscriptions();
    }


    /**
     * Get the wakeup time.  This time acts as the seed for calculating the 72-hour window
     */
    private _determineWakeupTime(): moment.Moment {
        let previousTime: moment.Moment;
        let wakeupTime: moment.Moment;
        if (this._sleepProfile.wakeupTimeIsSet) {
            // console.log("ya ya wakeup time set boyo")
            wakeupTime = this._sleepProfile.wakeupTime;
        } else {
            if (this._previousSleepProfile) {
                // console.log("  Good: we have a previous sleep profile")
                if (this._previousSleepProfile.bedTimeIsSet) {
                    previousTime = moment(this._previousSleepProfile.bedTime);
                } else if (this._previousSleepProfile.wakeupTimeIsSet) {
                    const awakeForHours: number = 16;
                    previousTime = moment(this._previousSleepProfile.wakeupTime).add(awakeForHours, 'hours');
                }
            }
            if (!wakeupTime && !previousTime) {
                wakeupTime = this._sleepProfile.defaultWakeupTime;
            } else if (!wakeupTime && previousTime) {
                wakeupTime = moment(previousTime).add(8, 'hours');
            } else {
                console.log('Error');
            }
        }
        // console.log("Returning value: " + wakeupTime.format("YYYY-MM-DD hh:mm a"))
        return wakeupTime;
    }




    private _updateChangeSubscriptions() {
        this._changeSubscriptions.forEach((sub) => { sub.unsubscribe(); });
        this._changeSubscriptions = [];


        this._changeSubscriptions.push(this._timelog.timelogUpdated$
            .subscribe((data: { timelogDataItems: DaybookTimelogEntryDataItem[], delineators: string[] }) => {
                this._recalculate();
                this._dataChanged$.next(true);
            }));
        this._changeSubscriptions.push(this._sleepProfile.sleepProfileUpdated$
            .subscribe((sleepProfileData: DaybookDayItemSleepProfileData) => {
                // this._sleepProfile.setFullProfile(sleepProfileData);
                this._recalculate();
                this._dataChanged$.next(true);
            }));

    }

}