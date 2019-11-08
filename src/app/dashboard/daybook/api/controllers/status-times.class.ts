import { StatusAtTime } from "./status-at-time.interface";
import * as moment from 'moment';
import { ReferencerTimeEventName } from "./referencer-time-event-name.enum";

export class StatusTimes {

    constructor(sleepStatusTimes: StatusAtTime[], ) {

        this._sleepStatusTimes = sleepStatusTimes;
        this._recalculate();
    }

    private _sleepStatusTimes: StatusAtTime[] = [];
    private get sleepStatusTimes(): StatusAtTime[] { return this._sleepStatusTimes; }

    public previousBedTimeMin(): moment.Moment { return; }
    public previousBedTimeMax(): moment.Moment { return; }

    public wakeupTimeMin(): moment.Moment { return; }
    public wakeupTimeMax(): moment.Moment { return; }

    public bedTimeMin(): moment.Moment { return; }
    public bedTimeMax(): moment.Moment { return; }

    public get previousDayWakeupTime(): StatusAtTime {
        return this._sleepStatusTimes.find(item => item.name === ReferencerTimeEventName.PreviousDayWakeupTime);
    }
    public get previousDayBedTime(): StatusAtTime {
        return this._sleepStatusTimes.find(item => item.name === ReferencerTimeEventName.PreviousDayBedTime);
    }
    public get thisDayWakeupTime(): StatusAtTime {
        return this._sleepStatusTimes.find(item => item.name === ReferencerTimeEventName.ThisDayWakeupTime);
    }
    public get thisDayBedTime(): StatusAtTime {
        return this._sleepStatusTimes.find(item => item.name === ReferencerTimeEventName.ThisDayBedTime);
    }
    public get followingDayWakeupTime(): StatusAtTime {
        return this._sleepStatusTimes.find(item => item.name === ReferencerTimeEventName.FollowingDayWakeupTime);
    }
    public get followingDayBedTime(): StatusAtTime {
        return this._sleepStatusTimes.find(item => item.name === ReferencerTimeEventName.FollowingDayBedTime);
    }

    private _recalculate() {
        let sleepStatusTimes = this.sleepStatusTimes;
        sleepStatusTimes = this._sortByStartTime(sleepStatusTimes);
        sleepStatusTimes = this._populateMissingSleepTimes(sleepStatusTimes);
        sleepStatusTimes = this._sortByStartTime(sleepStatusTimes);




        sleepStatusTimes.map((item) => {
            let s: string = "";
            if (item.startTime) {
                s += " " + item.startTime.format("YYYY-MM-DD hh:mm a") + "  - ";
            } else {
                s += " null start time  - ";
            }
            s += item.name;
            return s;
        }).forEach((item) => {
            console.log(item)
        })


    }

    private _populateMissingSleepTimes(sleepStatusTimes: StatusAtTime[]): StatusAtTime[] {
        if (!this.thisDayWakeupTime) {
            console.log("Error");
        } else {
            let defaultBedTime: moment.Moment = moment(this.thisDayWakeupTime.startTime).add(16, 'hours');
            if (sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.ThisDayBedTime).isSet === false) {
                this.thisDayBedTime.startTime = defaultBedTime;
            }
            if (sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.PreviousDayBedTime).isSet === false) {
                this.previousDayBedTime.startTime = moment(defaultBedTime).subtract(24, 'hours');
            }
            if (sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.PreviousDayWakeupTime).isSet === false) {
                console.log("  ThisDayWakeupTime: " + this.thisDayWakeupTime.startTime.format("YYYY-MM-DD hh:mm a"))
                let zinger =  moment(this.thisDayWakeupTime.startTime).subtract(24, 'hours');
                this.previousDayWakeupTime.startTime = zinger;
                console.log("  Zinger:  " + zinger.format("YYYY-MM-DD hh:mm a"))
                console.log("  Previous wakeup time set to: " + this.previousDayWakeupTime.startTime.format("YYYY-MM-DD hh:mm a"))
            }
            if (sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.FollowingDayBedTime).isSet === false) {
                this.followingDayBedTime.startTime = moment(defaultBedTime).add(24, 'hours');
            }
            if (sleepStatusTimes.find(i => i.name === ReferencerTimeEventName.FollowingDayWakeupTime).isSet === false) {
                this.followingDayWakeupTime.startTime = moment(this.thisDayWakeupTime.startTime).add(24, 'hours');
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