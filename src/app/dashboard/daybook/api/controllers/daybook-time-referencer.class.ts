import { DaybookDayItemTimelog } from "./daybook-day-item-timelog.class";
import { DaybookSleepProfile } from "./daybook-sleep-profile.class";
import { Subject, Observable, BehaviorSubject, Subscription } from "rxjs";
import * as moment from 'moment';
import { DaybookTimelogEntryDataItem } from "../data-items/daybook-timelog-entry-data-item.interface";
import { DaybookDayItemSleepProfileData } from "../data-items/daybook-day-item-sleep-profile-data.interface";
import { RoundToNearestMinute } from "../../../../shared/utilities/time-utilities/round-to-nearest-minute.class";

export class DaybookTimeReferencer {
    /**
     * This class takes the completed SleepProfile and Timelog classes and puts them together 
     * for the purpose of being able to make determinations about the time
     */
    constructor(timelog: DaybookDayItemTimelog, sleepProfile: DaybookSleepProfile, dateYYYYMMDD: string) {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._timelog = timelog;
        this._sleepProfile = sleepProfile;
        this._recalculate();
    }

    private _dateYYYYMMDD: string = "";
    private _timelog: DaybookDayItemTimelog;
    private _sleepProfile: DaybookSleepProfile;

    private _previousTimelog: DaybookDayItemTimelog;
    private _previousSleepProfile: DaybookSleepProfile;

    private _followingTimelog: DaybookDayItemTimelog;
    private _followingSleepProfile: DaybookSleepProfile;

    private _previousDataChanged: boolean = false;
    private _followingDataChanged: boolean = false;

    private _sleepStatusTimes: { start: moment.Moment, end: moment.Moment, status: "AWAKE" | "SLEEP" }[] = [];

    public get previousSleep(): DaybookSleepProfile { return this._previousSleepProfile; }
    public get followingSleep(): DaybookSleepProfile { return this._followingSleepProfile; }

    public get previousDataChanged(): boolean { return this._previousDataChanged; }
    public get followingDataChanged(): boolean { return this._followingDataChanged; }

    public get daybookTimelogEntryDataItems(): DaybookTimelogEntryDataItem[] { return this._timelog.timelogEntryItems.map((item) => { return item.dataEntryItem; }); }
    public get timeDelineators(): string[] { return this._timelog.timeDelineators; }
    public get sleepProfileData(): DaybookDayItemSleepProfileData { return this._sleepProfile.sleepProfileData; }

    public get sleepStatusTimes(): { start: moment.Moment, end: moment.Moment, status: "AWAKE" | "SLEEP" }[] { return this._sleepStatusTimes; }

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

    private _dataChanged$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public get dataChanged$(): Observable<boolean> { return this._dataChanged$.asObservable(); }

    public childDataChanged() {
        console.log("Child data changed.  NExting --> ")
        this._dataChanged$.next(true);
    }

    public sleepStateAtTime(timeToCheck: moment.Moment): "AWAKE" | "SLEEP" {
        let foundStatus = this._sleepStatusTimes.find((section) => {
            return timeToCheck.isSameOrAfter(section.start) && timeToCheck.isSameOrBefore(section.end);
        });
        if (foundStatus) {
            return foundStatus.status;
        } else {
            console.log("Could not find status at time: " + timeToCheck.format("YYYY-MM-DD") + " on day: " + this._dateYYYYMMDD);
        }
        return null;
    }



    private _recalculate() {
        console.log(this._dateYYYYMMDD + "  Time referencer.recalculating()")
        let sleepStatusTimes: { start: moment.Moment, end: moment.Moment, status: "AWAKE" | "SLEEP" }[] = [];

        const startOfPreviousDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day").subtract(24, "hours");
        const startOfDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day");
        const startOfNextDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day").add(24, "hours");
        const endOfNextDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day").add(48, "hours");

        const thisDayWakeupTime: moment.Moment = this._determineWakeupTime();
        const thisDaySleepStartTime: moment.Moment = this._determineThisDaySleepStartTime(thisDayWakeupTime);
        const thisDayBedTime: moment.Moment = this._determineThisDayBedTime(thisDayWakeupTime);
        const previousWakeupTime: moment.Moment = this._determinePreviousWakeupTime(thisDayWakeupTime);
        const previousStartSleepTime: moment.Moment = this._determinePreviousStartSleepTime(thisDaySleepStartTime);
        const nextWakeupTime: moment.Moment = this._determineNextWakeupTime(thisDayWakeupTime);
        const nextBedTime: moment.Moment = this._determineNextBedTime(thisDayBedTime);

        if(previousStartSleepTime.isSameOrBefore(startOfPreviousDay)){
            sleepStatusTimes.push({ start: startOfPreviousDay, end: previousWakeupTime, status: "SLEEP" });
        }else{
            sleepStatusTimes.push({ start: startOfPreviousDay, end: previousStartSleepTime, status: "AWAKE" });
            sleepStatusTimes.push({ start: previousStartSleepTime, end: previousWakeupTime, status: "SLEEP" });
        }
        sleepStatusTimes.push({ start: previousWakeupTime, end: thisDaySleepStartTime, status: "AWAKE" });
        sleepStatusTimes.push({ start: thisDaySleepStartTime, end: thisDayWakeupTime, status: "SLEEP" });
        sleepStatusTimes.push({ start: thisDayWakeupTime, end: thisDayBedTime, status: "AWAKE" });
        sleepStatusTimes.push({ start: thisDayBedTime, end: nextWakeupTime, status: "SLEEP" });
        if(nextBedTime.isBefore(endOfNextDay)){
            sleepStatusTimes.push({ start: nextWakeupTime, end: nextBedTime, status: "AWAKE" });
            sleepStatusTimes.push({ start: nextBedTime, end: endOfNextDay, status: "SLEEP" });
        }else{
            sleepStatusTimes.push({ start: nextWakeupTime, end: nextBedTime, status: "AWAKE" });
        }


        console.log("Sleep status times: ")
        sleepStatusTimes.forEach((t) => {
            console.log("   " + t.start.format("YYYY-MM-DD hh:mm a") + " - " + t.end.format("YYYY-MM-DD hh:mm a") + "  " + t.status);
        })


        this._sleepStatusTimes = sleepStatusTimes;
    }



    /**
     * Get the wakeup time.  This time acts as the seed for calculating the 72-hour window
     */
    private _determineWakeupTime(): moment.Moment {
        const startOfDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day");
        let previousTime: moment.Moment;
        let wakeupTime: moment.Moment;
        if (this._sleepProfile.wakeupTimeIsSet) {
            wakeupTime = this._sleepProfile.wakeupTime;
        } else {
            if (this._previousSleepProfile) {
                // console.log("  Good: we have a previous sleep profile")
                if (this._previousSleepProfile.fallAsleepTimeIsSet) {
                    previousTime = moment(this._previousSleepProfile.fallAsleepTime);
                } else if (this._previousSleepProfile.bedTimeIsSet) {
                    previousTime = moment(this._previousSleepProfile.bedTime);
                } else if (this._previousSleepProfile.wakeupTimeIsSet) {
                    const awakeForHours: number = 16;
                    previousTime = moment(this._previousSleepProfile.wakeupTime).add(awakeForHours, "hours");
                }
            }
            if (!previousTime) {
                if (this._previousTimelog) {
                    let lastTimelogEntryTime = this._previousTimelog.lastTimelogEntryItemTime;
                    if (lastTimelogEntryTime.isAfter(this._sleepProfile.defaultPreviousFallAsleepTime)) {

                        previousTime = moment(lastTimelogEntryTime);
                        if (previousTime.isAfter(startOfDay)) {
                            previousTime = moment(startOfDay);
                        }
                    }
                }
            }

            if (!wakeupTime && !previousTime) {
                previousTime = this._sleepProfile.defaultPreviousFallAsleepTime;
                wakeupTime = RoundToNearestMinute.roundToNearestMinute(moment(previousTime).add(7, "hours").add(30, "minutes"), 30, "UP");
            } else if (!wakeupTime && previousTime) {
                wakeupTime = RoundToNearestMinute.roundToNearestMinute(moment(previousTime).add(7, "hours").add(30, "minutes"), 30, "UP");
            } else {
                console.log("Error")
            }
        }

        return wakeupTime;
    }
    private _determineThisDaySleepStartTime(thisDayWakeupTime: moment.Moment): moment.Moment {
        if (this._sleepProfile.previousFallAsleepTimeIsSet) {
            return this._sleepProfile.previousFallAsleepTime;
        } else {
            if (this._previousSleepProfile) {
                if (this._previousSleepProfile.fallAsleepTimeIsSet) {
                    return this._previousSleepProfile.fallAsleepTime;
                } else if (this._previousSleepProfile.bedTimeIsSet) {
                    return this._previousSleepProfile.bedTime;
                }
            }
        }
        return RoundToNearestMinute.roundToNearestMinute(moment(thisDayWakeupTime).subtract(8, "hours"), 30, "DOWN");
    }
    private _determineThisDayBedTime(thisDayWakeupTime: moment.Moment): moment.Moment {
        if (this._sleepProfile.bedTimeIsSet) {
            return this._sleepProfile.bedTime;
        } else {
            return RoundToNearestMinute.roundToNearestMinute(moment(thisDayWakeupTime).add(15, "hours").add(30, "minutes"), 30, "UP");
        }
    }
    private _determinePreviousWakeupTime(thisDayWakeupTime: moment.Moment) {
        if (this._previousSleepProfile) {
            if (this._previousSleepProfile.wakeupTimeIsSet) {
                return thisDayWakeupTime;
            }
        }
        return moment(thisDayWakeupTime).subtract(24, "hours");
    }
    private _determinePreviousStartSleepTime(thisDaySleepStartTime: moment.Moment): moment.Moment {
        if (this._previousSleepProfile) {
            if (this._previousSleepProfile.previousFallAsleepTimeIsSet) {
                return this._previousSleepProfile.previousFallAsleepTime;
            } else if (this._previousSleepProfile.bedTimeIsSet) {
                return this._previousSleepProfile.bedTime;
            }
        }
        return moment(thisDaySleepStartTime).subtract(24, "hours");
    }
    private _determineNextWakeupTime(thisDayWakeupTime: moment.Moment): moment.Moment {
        if (this._followingSleepProfile) {
            if (this._followingSleepProfile.wakeupTimeIsSet) {
                return this._followingSleepProfile.wakeupTime;
            }
        }
        return moment(thisDayWakeupTime).add(24, "hours");
    }
    private _determineNextBedTime(thisDayBedTime: moment.Moment): moment.Moment {
        if (this._followingSleepProfile) {
            if (this._followingSleepProfile.bedTimeIsSet) {
                return this._followingSleepProfile.bedTime;
            }
        }
        return moment(thisDayBedTime).add(24, "hours")
    }


    private _changeSubscriptions: Subscription[] = [];
    private _updateChangeSubscriptions() {
        this._changeSubscriptions.forEach((sub) => { sub.unsubscribe(); });
        this._changeSubscriptions = [];


        this._changeSubscriptions.push(this._timelog.timelogUpdated$.subscribe((data: { timelogDataItems: DaybookTimelogEntryDataItem[], delineators: string[] }) => {

        }));
        this._changeSubscriptions.push(this._sleepProfile.sleepProfileUpdated$.subscribe((sleepProfileData: DaybookDayItemSleepProfileData) => {
            this._updateSleepProfileChanges(sleepProfileData)
        }));

    }

    private _updateSleepProfileChanges(sleepProfileData: DaybookDayItemSleepProfileData) {

    }


}