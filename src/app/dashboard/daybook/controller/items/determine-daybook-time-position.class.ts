import { DaybookTimePosition } from "../../daybook-time-position-form/daybook-time-position.enum";
import * as moment from 'moment';

export class DetermineDaybookTimePosition {
    
    private clock: moment.Moment;
    private wakeupTime: moment.Moment;
    private prevDayFallAsleepTime: moment.Moment;

    private fallAsleepTime: moment.Moment;
    private prevDayActivities: boolean;
    private wakeupTimeIsSet: boolean;
    
    constructor(clock: moment.Moment, wakeupTime: moment.Moment, prevDayFallAsleepTime: moment.Moment, fallAsleepTime: moment.Moment, prevDayActivities: boolean, wakeupTimeIsSet: boolean) {
        this.clock = clock;
        this.wakeupTime = wakeupTime;
        this.prevDayFallAsleepTime = prevDayFallAsleepTime;
        this.fallAsleepTime = fallAsleepTime;
        this.prevDayActivities = prevDayActivities;
        this.wakeupTimeIsSet = wakeupTimeIsSet; 
        this._determineCurrentTimePosition();
    }

    private _currentTimePosition: DaybookTimePosition;

    private _determineCurrentTimePosition() {
        let timePosition: DaybookTimePosition;

        // console.log("Clock is: " + this._clock.format('YYYY-MM-DD hh:mm a'))
        // console.log("Wakeup is: " + this.wakeupTime.format('YYYY-MM-DD hh:mm a') + " isSet? " , this.wakeupTimeIsSet);
        const isBeforeWakeupTime: boolean = moment(this.clock).isBefore(this.wakeupTime);
        // console.log("now is before wakeupTime? " , isBeforeWakeupTime)
        
        if (isBeforeWakeupTime) {
            const sleepStartTime = moment(this.prevDayFallAsleepTime);
            const sleepMS = moment(this.wakeupTime).diff(sleepStartTime, 'milliseconds');
            if (sleepMS <= 0) {
                console.log('Error with sleep time calculations.');
            } else {
                const endOfFirstQuartile = moment(sleepStartTime).add((sleepMS / 4), 'milliseconds');
                const startOfFourthQuartile = moment(this.wakeupTime).subtract((sleepMS) / 4, 'milliseconds');
                const isFirstQuartile = moment(this.clock).isSameOrBefore(endOfFirstQuartile);
                const isFourthQuartile = moment(this.clock).isSameOrAfter(startOfFourthQuartile);
                const isMiddle = moment(this.clock).isSameOrAfter(endOfFirstQuartile) && moment(this.clock).isSameOrBefore(startOfFourthQuartile);
                if (isFirstQuartile) {
                    if (this.prevDayActivities) {
                        timePosition = DaybookTimePosition.AWAKE_FROM_PREV_DAY;
                    } else {
                        timePosition = DaybookTimePosition.UNCLEAR;
                    }
                } else if (isFourthQuartile) {
                    timePosition = DaybookTimePosition.NEW_DAY;
                } else if (isMiddle) {
                    timePosition = DaybookTimePosition.UNCLEAR;
                } else {
                    console.log('Error with time calculations');
                }
            }
        } else {
            if (!this.wakeupTimeIsSet) {
                timePosition = DaybookTimePosition.NEW_DAY;
            } else {
                const awakeMS = moment(this.fallAsleepTime).diff(this.wakeupTime, 'milliseconds');
                const startOfFourthQuartile = moment(this.fallAsleepTime).subtract((awakeMS) / 4, 'milliseconds');
                const isAfterFourthQuartile = moment(this.clock).isSameOrAfter(startOfFourthQuartile);
                if (isAfterFourthQuartile) {
                    timePosition = DaybookTimePosition.APPROACHING_SLEEP;
                } else {
                    timePosition = DaybookTimePosition.NORMAL;
                }
            }
        }
        if (!timePosition) {
            console.log('Error with finding timePosition');
        }

        // console.log("Time position is: " + timePosition);
        this._currentTimePosition = timePosition;
    }


    public get currentTimePosition(): DaybookTimePosition {
        return this._currentTimePosition;
    }
}