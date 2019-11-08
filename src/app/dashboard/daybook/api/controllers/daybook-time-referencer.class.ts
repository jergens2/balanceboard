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

    public getNewTimelogEntryStartTime() {
        const lastActivityTime = this._getLastActivityTime();
        const now: moment.Moment = moment();
        const wakeupTime: moment.Moment = this.determineWakeupTime();
        if (now.isBefore(wakeupTime)) {
            return lastActivityTime;
        } else {
            if (!this._sleepProfile.wakeupTimeIsSet) {
                return wakeupTime;
            } else {
                if (lastActivityTime.isSameOrAfter(wakeupTime)) {
                    return lastActivityTime;
                } else {
                    return wakeupTime;
                }
            }
        }
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


    public sleepStateAtTime(timeToCheck: moment.Moment): StatusAtTime {

        return null;
    }

    public get previousBedTimeMin(): moment.Moment { return this._statusTimes.previousBedTimeMin(); }
    public get previousBedTimeMax(): moment.Moment { return this._statusTimes.previousBedTimeMax(); }

    public get wakeupTimeMin(): moment.Moment { return this._statusTimes.wakeupTimeMin(); }
    public get wakeupTimeMax(): moment.Moment { return this._statusTimes.wakeupTimeMax(); }

    public get bedTimeMin(): moment.Moment { return this._statusTimes.bedTimeMin(); }
    public get bedTimeMax(): moment.Moment { return this._statusTimes.bedTimeMax(); }

    public get previousDayWakeupTime(): moment.Moment { return this._statusTimes.previousDayWakeupTime.startTime; }
    public get previousDayBedTime(): moment.Moment { return this._statusTimes.previousDayBedTime.startTime; }

    public get thisDayWakeupTime(): moment.Moment { return this._statusTimes.thisDayWakeupTime.startTime; }
    public get thisDayBedTime(): moment.Moment { return this._statusTimes.thisDayBedTime.startTime; }

    public get followingDayWakeupTime(): moment.Moment { return this._statusTimes.followingDayWakeupTime.startTime; }
    public get followingDayBedTime(): moment.Moment { return this._statusTimes.followingDayBedTime.startTime; }

    public get startOfPreviousDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').subtract(24, 'hours'); }
    public get startOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day'); }
    public get startOfNextDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    public get endOfNextDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(48, 'hours'); }


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

        sleepStatusTimes = sleepStatusTimes.concat(this._timelog.activityTimes.filter(i => i.isActive === true).map((item) => {
            return {
                startTime: item.start,
                endTime: item.end,
                isAWake: false,
                isActive: true,
                isSet: false,
                name: ReferencerTimeEventName.BeginActivity,
            };
        }));
        if (this._followingTimelog) {
            sleepStatusTimes = sleepStatusTimes.concat(this._followingTimelog.activityTimes.filter(i => i.isActive === true).map((item) => {
                return {
                    startTime: item.start,
                    endTime: item.end,
                    isAWake: false,
                    isActive: true,
                    isSet: false,
                    name: ReferencerTimeEventName.BeginActivity,
                };
            }));
        }
        if(this._previousTimelog){
            sleepStatusTimes = sleepStatusTimes.concat(this._previousTimelog.activityTimes.filter(i => i.isActive === true).map((item) => {
                return {
                    startTime: item.start,
                    endTime: item.end,
                    isAWake: false,
                    isActive: true,
                    isSet: false,
                    name: ReferencerTimeEventName.BeginActivity,
                };
            }));
        }


        let wakeupTimeStatus = {
            startTime: this.determineWakeupTime(),
            endTime: null,
            isAWake: true,
            isActive: false,
            isSet: true,
            name: ReferencerTimeEventName.ThisDayWakeupTime,
        }
        sleepStatusTimes.push(wakeupTimeStatus);
        console.log("This day wakeup time determined to be: " + wakeupTimeStatus.startTime.format("YYYY-MM-DD hh:mm a"))
        let bedTimeStatus = {
            startTime: null,
            endTime: null,
            isAWake: true,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.ThisDayBedTime,
        }
        if (this._sleepProfile.bedTimeIsSet) {
            bedTimeStatus.startTime = this._sleepProfile.bedTime;
        }
        sleepStatusTimes.push(bedTimeStatus);

        let previousWakeupTime = {
            startTime: null,
            endTime: null,
            isAWake: true,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.PreviousDayWakeupTime,
        }
        let previousBedTime = {
            startTime: null,
            endTime: null,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.PreviousDayBedTime,
        }
        let followingDayWakeupTime = {
            startTime: null,
            endTime: null,
            isAWake: true,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.FollowingDayWakeupTime,
        }
        let followingDayBedTime = {
            startTime: null,
            endTime: null,
            isAWake: false,
            isActive: false,
            isSet: false,
            name: ReferencerTimeEventName.FollowingDayBedTime,
        }


        if (this._previousSleepProfile) {
            if (this._previousSleepProfile.wakeupTimeIsSet) {
                previousWakeupTime.startTime = this._previousSleepProfile.wakeupTime;
            }
            if (this._previousSleepProfile.bedTimeIsSet) {
                previousBedTime.startTime = this._previousSleepProfile.bedTime;
            }
        }
        if (this._followingSleepProfile) {
            if (this._followingSleepProfile.wakeupTimeIsSet) {
                followingDayWakeupTime.startTime = this._followingSleepProfile.wakeupTime;
            }
            if (this._followingSleepProfile.bedTimeIsSet) {
                followingDayBedTime.startTime = this._followingSleepProfile.bedTime;
            }
        }
        sleepStatusTimes.push(previousBedTime);
        sleepStatusTimes.push(previousWakeupTime);
        sleepStatusTimes.push(followingDayBedTime);
        sleepStatusTimes.push(followingDayWakeupTime);

        console.log("CONSTRUCTING STATUS TIMES:  " + this._dateYYYYMMDD);
        this._statusTimes = new StatusTimes(sleepStatusTimes);
        this._updateChangeSubscriptions();
    }

    private _getLastActivityTime(): moment.Moment {
        if (this._timelog.lastTimelogEntryItemTime.isSame(this.startOfThisDay)) {
            if (!this._previousTimelog.lastTimelogEntryItemTime.isAfter(this.startOfPreviousDay)) {
                return this._previousTimelog.lastTimelogEntryItemTime;
            }
        }
        return this._timelog.lastTimelogEntryItemTime;
    }


    /**
     * Get the wakeup time.  This time acts as the seed for calculating the 72-hour window
     */
    public determineWakeupTime(): moment.Moment {
        let previousTime: moment.Moment;
        let wakeupTime: moment.Moment;
        if (this._sleepProfile.wakeupTimeIsSet) {
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
        console.log("Returning value: " + wakeupTime.format("YYYY-MM-DD hh:mm a"))
        return wakeupTime;
    }




    private _updateChangeSubscriptions() {
        this._changeSubscriptions.forEach((sub) => { sub.unsubscribe(); });
        this._changeSubscriptions = [];


        this._changeSubscriptions.push(this._timelog.timelogUpdated$.subscribe((data: { timelogDataItems: DaybookTimelogEntryDataItem[], delineators: string[] }) => {
            this._dataChanged$.next(true);
        }));
        this._changeSubscriptions.push(this._sleepProfile.sleepProfileUpdated$.subscribe((sleepProfileData: DaybookDayItemSleepProfileData) => {
            this._updateThisSleepProfileChanges();
        }));

    }

    private _updateThisSleepProfileChanges() {

    }


}