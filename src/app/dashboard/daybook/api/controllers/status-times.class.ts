import { StatusAtTime } from "./status-at-time.interface";
import * as moment from 'moment';
import { ReferencerTimeEventName } from "./referencer-time-event-name.enum";

export class StatusTimes {

    constructor(sleepStatusTimes: StatusAtTime[], dateYYYYMMDD: string) {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._sleepStatusTimes = sleepStatusTimes;
        this._recalculate();
    }

    private _dateYYYYMMDD: string;
    private _sleepStatusTimes: StatusAtTime[] = [];
    private get sleepStatusTimes(): StatusAtTime[] { return this._sleepStatusTimes; }




    private _previousDayWakeupTime: StatusAtTime;
    private _previousDayBedTime: StatusAtTime;
    private _thisDayWakeupTime: StatusAtTime;
    private _thisDayBedTime: StatusAtTime;
    private _followingDayWakeupTime: StatusAtTime;
    private _followingDayBedTime: StatusAtTime;

    private _wakeupTimeMin: moment.Moment;
    private _wakeupTimeMax: moment.Moment;
    private _bedTimeMin: moment.Moment;
    private _bedTimeMax: moment.Moment;

    public get previousDayWakeupTime(): StatusAtTime { return this._previousDayWakeupTime; }
    public get previousDayBedTime(): StatusAtTime { return this._previousDayBedTime; }
    public get thisDayWakeupTime(): StatusAtTime { return this._thisDayWakeupTime; }
    public get thisDayBedTime(): StatusAtTime { return this._thisDayBedTime; }
    public get followingDayWakeupTime(): StatusAtTime { return this._followingDayWakeupTime; }
    public get followingDayBedTime(): StatusAtTime { return this._followingDayBedTime; }

    public get wakeupTimeMin(): moment.Moment { return this._wakeupTimeMin; }
    public get wakeupTimeMax(): moment.Moment { return this._wakeupTimeMax; }
    public get bedTimeMin(): moment.Moment { return this._bedTimeMin; }
    public get bedTimeMax(): moment.Moment { return this._bedTimeMax; }

    public get activeDayIsToday(): boolean {
        const today = moment().format('YYYY-MM-DD');
        if (today === this._dateYYYYMMDD) {
            return true;
        } else {
            return false;
        }
    }

    public getStateAtTime(timeToCheck): StatusAtTime {
        console.log("Method incomplete: FINISH")
        console.log("Getting sleep state at time: " + timeToCheck.format("YYYY-MM-DD hh:mm a"));
        let statusesToCheck = this._sleepStatusTimes.filter((item) => {
            if (item.startTime !== null && item.endTime !== null) {
                if (item.startTime.isAfter(item.endTime)) {
                    //duration is greater than 0;
                    return true;
                }
            }
        });

        console.log("Statuses to check: ")
        statusesToCheck.forEach((item) => {
            console.log("   " + item.startTime.format("YYYY-MM-DD hh:mm a"), item.name)
        })

        return statusesToCheck[0];
    }

    private _recalculate() {

        this._sleepStatusTimes = this._populateMissingSleepTimes(this.sleepStatusTimes);
        this._sleepStatusTimes = this._sortByStartTime(this.sleepStatusTimes);
        this._sleepStatusTimes = this._checkForConflicts(this.sleepStatusTimes);

        this._setValues();

        // let wakeTimes = this._buildSleepSections();
        // this._sleepStatusTimes = this._checkForConflicts(this.sleepStatusTimes);

        // let wakeTimes = this._sleepStatusTimes.filter((i) => {
        //     const isPreviousWakeTime = i.name === ReferencerTimeEventName.PreviousDayWakeupTime;
        //     const isCurrentWakeTime = i.name === ReferencerTimeEventName.ThisDayWakeupTime;
        //     const isNextWakeTime = i.name === ReferencerTimeEventName.FollowingDayWakeupTime;
        //     let isDuration: boolean = false; 
        //     if(i.startTime !== null && i.endTime !== null){
        //         if(!i.startTime.isSame(i.endTime) ){
        //             if(i.startTime.isBefore(i.endTime)){
        //                 isDuration = true;
        //             }else{
        //                 console.log(" How ?");
        //             }
        //         }
        //     }
        //     return (isPreviousWakeTime || isCurrentWakeTime || isNextWakeTime) && isDuration;
        // });

        // wakeTimes.forEach((i)=>{
        //     console.log(" Wake time: " + i.startTime.format('YYYY-MM-DD hh:mm a') + " - " + i.endTime.format("YYYY-MM-DD hh:mm a") + " , " + i.name)
        // })
        // this._sleepStatusTimes.map((item) => {
        //     let s: string = "";
        //     if (item.startTime) {
        //         s += " " + item.startTime.format("YYYY-MM-DD hh:mm a") + "  - ";
        //     } else {
        //         s += " null start time  - ";
        //     }
        //     if (item.endTime){
        //         s += " " + item.endTime.format("YYYY-MM-DD hh:mm a");
        //     }else{
        //         s += " null end time - " 
        //     }
        //     s += item.name;
        //     return s;
        // }).forEach((item) => {
        //     console.log(item)
        // })


    }

    private _setValues() {
        this._previousDayWakeupTime = this._sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.PreviousDayWakeupTime);
        this._previousDayBedTime = this._sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.PreviousDayBedTime);
        this._thisDayWakeupTime = this._sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.ThisDayWakeupTime);
        this._thisDayBedTime = this._sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.ThisDayBedTime);
        this._followingDayWakeupTime = this._sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.FollowingDayBedTime);
        this._followingDayBedTime = this._sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.FollowingDayBedTime);

        // console.log(" isSet? " + this.previousDayWakeupTime.isSet + " previousWakeupTime : " + this.previousDayWakeupTime.startTime.format("YYYY-MM-DD hh:mm a"))
        // console.log(" isSet? " + this.previousDayBedTime.isSet + " previousBedTime : " + this.previousDayBedTime.startTime.format("YYYY-MM-DD hh:mm a"))
        // console.log(" isSet? " + this.thisDayWakeupTime.isSet + " thisDayWakeupTime : " + this.thisDayWakeupTime.startTime.format("YYYY-MM-DD hh:mm a"))
        // console.log(" isSet? " + this.thisDayBedTime.isSet + " thisDayBedTime : " + this.thisDayBedTime.startTime.format("YYYY-MM-DD hh:mm a"))
        // console.log(" isSet? " + this.followingDayWakeupTime.isSet + " followingDayWakeupTime : " + this.followingDayWakeupTime.startTime.format("YYYY-MM-DD hh:mm a"))
        // console.log(" isSet? " + this.followingDayBedTime.isSet + " followingDayBedTIme : " + this.followingDayBedTime.startTime.format("YYYY-MM-DD hh:mm a"))


        this._wakeupTimeMin = moment(this._previousDayBedTime.startTime);
        this._wakeupTimeMax = moment(this._thisDayBedTime.startTime);
        this._bedTimeMin = moment(this._thisDayWakeupTime.startTime);
        this._bedTimeMax = moment(this._followingDayWakeupTime.startTime);


    }


    private _checkForConflicts(sleepStatusTimes: StatusAtTime[]): StatusAtTime[] {

        let wakeTimes = [
            this._previousDayWakeupTime,
            this._previousDayBedTime,
            this._thisDayWakeupTime,
            this._thisDayBedTime,
            this._followingDayBedTime,
            this._followingDayWakeupTime,
        ]

        let activityTimes = sleepStatusTimes.filter(i => i.isActive === true && i.name === ReferencerTimeEventName.BeginActivity);
        wakeTimes.forEach((wakeTime) => {
            // console.log("wake time: " + item.startTime.format("YYYY-MM-DD hh:mm a") + " - " + item.endTime.format("YYYY-MM-DD hh:mm a") + "  " + item.name)
            activityTimes.forEach((activityTime) => {

                const crosses: boolean =
                    activityTime.startTime.isBefore(wakeTime.startTime) && activityTime.endTime.isAfter(wakeTime.startTime);
                if (crosses) {
                    console.log(" WARNING! , activity time crosses sleep time")
                }

                // const crossesStart: boolean =
                //     activityTime.startTime.isBefore(wakeTime.startTime) && activityTime.endTime.isAfter(wakeTime.startTime);
                // const crossesEnd: boolean =
                //     activityTime.startTime.isBefore(wakeTime.endTime) && activityTime.endTime.isAfter(wakeTime.endTime);
                // const isInside: boolean =
                //     activityTime.startTime.isSameOrAfter(wakeTime.startTime) && activityTime.endTime.isSameOrBefore(wakeTime.endTime);
                // const isPrior: boolean =
                //     activityTime.startTime.isBefore(wakeTime.startTime) && activityTime.endTime.isSameOrBefore(wakeTime.startTime);
                // const isAfter: boolean =
                //     activityTime.startTime.isSameOrAfter(wakeTime.endTime) && activityTime.endTime.isAfter(wakeTime.endTime);

                // if (crossesStart) {
                //     wakeTime.startTime = activityTime.startTime;
                // } else if (crossesEnd) {
                //     wakeTime.endTime = activityTime.endTime;
                // } else if (isInside) {

                // } else if (isPrior) {
                //     console.log("it's prior")

                // } else if (isAfter) {
                //     console.log(" its after")
                //     wakeTime.endTime = activityTime.endTime;
                // } else {
                //     console.log("Error")
                // }
            });
        });

        return sleepStatusTimes;
    }

    // private _buildSleepSections(): StatusAtTime[] {
    //     // const activityStatusTimes: StatusAtTime[] = sleepStatusTimes.filter(i => i.isActive === true);
    //     const wakeTimes: StatusAtTime[] = [
    //         {
    //             startTime: this.previousDayWakeupTime.startTime,
    //             endTime: this.previousDayBedTime.startTime,
    //             isAWake: true,
    //             isActive: false,
    //             isSet: false,
    //             name: ReferencerTimeEventName.PreviousDayWakeupTime
    //         },
    //         {
    //             startTime: this.thisDayWakeupTime.startTime,
    //             endTime: this.thisDayBedTime.startTime,
    //             isAWake: true,
    //             isActive: false,
    //             isSet: false,
    //             name: ReferencerTimeEventName.ThisDayWakeupTime
    //         },
    //         {
    //             startTime: this.followingDayWakeupTime.startTime,
    //             endTime: this.followingDayBedTime.startTime,
    //             isAWake: true,
    //             isActive: false,
    //             isSet: false,
    //             name: ReferencerTimeEventName.PreviousDayWakeupTime
    //         },
    //     ];
    //     return this._sortByStartTime(wakeTimes);

    // }

    private _populateMissingSleepTimes(sleepStatusTimes: StatusAtTime[]): StatusAtTime[] {
        let thisDayWakeupTime = this._sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.ThisDayWakeupTime);
        if (!thisDayWakeupTime) {
            console.log("Error");
        } else {
            let defaultBedTime: moment.Moment = moment(thisDayWakeupTime.startTime).add(16, 'hours');
            let thisDayBedTime = sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.ThisDayBedTime);
            if (thisDayBedTime.isSet === false) {
                thisDayBedTime.startTime = defaultBedTime;
            }
            let previousDayBedTime = sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.PreviousDayBedTime);
            if (previousDayBedTime.isSet === false) {
                previousDayBedTime.startTime = moment(defaultBedTime).subtract(24, 'hours');
            }
            let previousDayWakeupTime = sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.PreviousDayWakeupTime);
            if (previousDayWakeupTime.isSet === false) {
                // console.log("  ThisDayWakeupTime: " + thisDayWakeupTime.startTime.format("YYYY-MM-DD hh:mm a"))
                previousDayWakeupTime.startTime = moment(thisDayWakeupTime.startTime).subtract(24, 'hours');;
                // console.log("  Zinger:  " + zinger.format("YYYY-MM-DD hh:mm a"))
                // console.log("  Previous wakeup time set to: " + this.previousDayWakeupTime.startTime.format("YYYY-MM-DD hh:mm a"))
            }
            let followingDayBedTime = sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.FollowingDayBedTime);
            if (followingDayBedTime.isSet === false) {
                followingDayBedTime.startTime = moment(defaultBedTime).add(24, 'hours');
            }
            let followingDayWakeupTime = sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.FollowingDayWakeupTime);
            if (followingDayWakeupTime.isSet === false) {
                followingDayWakeupTime.startTime = moment(thisDayWakeupTime.startTime).add(24, 'hours');
            }
            return sleepStatusTimes;
        }
        return [];
    }

    private _sortByStartTime(sleepStatusTimes: StatusAtTime[]): StatusAtTime[] {
        return sleepStatusTimes.sort((s1, s2) => {
            if (s1.startTime) {
                if (s2.startTime) {
                    if (s1.startTime.isBefore(s2.startTime)) {
                        return -1;
                    } else if (s1.startTime.isAfter(s2.startTime)) {
                        return 1;
                    } else return 0;
                } else {
                    return -1;
                }
            } else {
                return 1;
            }

        });
    }

}