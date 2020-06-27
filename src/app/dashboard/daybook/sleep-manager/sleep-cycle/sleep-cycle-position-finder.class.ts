import * as moment from 'moment';
import { SleepCyclePosition } from './sleep-cycle-position.enum';
import { SleepProfileHTTPData } from '../sleep-profile-http-data.interface';

export class SleepCyclePositionFinder {
    constructor(data: SleepProfileHTTPData){
        if(data){
            const previousWakeupTime: moment.Moment = moment(data.previousWakeupTime);
            const nextFallAsleepTime: moment.Moment = moment(data.nextFallAsleepTime);
            const nextWakeupTime: moment.Moment = moment(data.nextWakeupTime);
            this._position = this._getCurrentPosition(previousWakeupTime, nextFallAsleepTime, nextWakeupTime)
        }else{
            console.log("Error: can't build sleep cycle position finder yet.")
        }
        
    }

    private _position: SleepCyclePosition;
    public get position(): SleepCyclePosition { return this._position; }
    /**
     * refer to:
     * sleep-cycle-position.jpg 
     */
    private _getCurrentPosition(previousWakeupTime: moment.Moment, nextFallAsleepTime: moment.Moment, nextWakeupTime: moment.Moment): SleepCyclePosition {
        const now: moment.Moment = moment();
        // console.log("Values: ", previousWakeupTime.format('YYYY-MM-DD hh:mm a'), nextFallAsleepTime.format('YYYY-MM-DD hh:mm a'), nextWakeupTime.format('YYYY-MM-DD hh:mm a'))
        const firstWakeupTime = moment(previousWakeupTime);
        const firstFallAsleepTime = moment(nextFallAsleepTime);
        const secondWakeupTime = moment(nextWakeupTime);

        const isAfterWakeup: boolean = now.isSameOrAfter(firstWakeupTime);
        const bedTimeWarning: moment.Moment = moment(firstFallAsleepTime).subtract(1, 'hour');
        const isBeforeBedtimeWarning: boolean = now.isBefore(bedTimeWarning);

        if (isAfterWakeup && isBeforeBedtimeWarning) {
            return SleepCyclePosition.ACTIVE;
        } else {
            const isBeforeSleepTime: boolean = now.isBefore(firstFallAsleepTime);
            if (isBeforeSleepTime) {
                return SleepCyclePosition.BEFORE_BEDTIME;
            } else if (!isBeforeSleepTime) {
                const sleepDuration = moment(nextWakeupTime).diff(nextFallAsleepTime, 'milliseconds');
                const endOfFirstQuarter = moment(nextFallAsleepTime).add((sleepDuration / 4), 'milliseconds');
                const endOfThirdQuarter = moment(nextFallAsleepTime).add(((sleepDuration / 4) * 3), 'milliseconds');
                if (now.isBefore(endOfFirstQuarter)) {
                    return SleepCyclePosition.AFTER_BEDTIME;
                } else if (now.isSameOrAfter(endOfFirstQuarter) && now.isBefore(endOfThirdQuarter)) {
                    return SleepCyclePosition.SLEEP;
                } else if (now.isSameOrAfter(endOfThirdQuarter) && now.isBefore(nextWakeupTime)) {
                    return SleepCyclePosition.EARLY_WAKEUP;
                } else if (now.isSameOrAfter(nextWakeupTime)) {
                    return SleepCyclePosition.NEXT_DAY;
                }
            }
        }
        return SleepCyclePosition.ACTIVE;
    }
}