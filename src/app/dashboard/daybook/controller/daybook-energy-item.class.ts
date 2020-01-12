import { DaybookEnergyLevel } from './daybook-energy-level.enum';
import * as moment from 'moment';

export class DaybookEnergyItem {


    public energyLevelStart: number;
    public energyLevelRateOfChangePerHour: number;

    public startTime: moment.Moment;
    public endTime: moment.Moment;


    constructor(startTime: moment.Moment, endTime: moment.Moment, energyLevelStart: number, energyLevelRateOfChangePerHour: number, ) {
        // console.log("Constructing daybookEnergyItem: " + startTime.format('YYYY-MM-DD hh:mm:ss a') + " to " + endTime.format('YYYY-MM-DD hh:mm:ss a') + " : energy level start : " + energyLevelStart + " - energyRateofChange : " + energyLevelRateOfChangePerHour)
        this.startTime = startTime;
        this.endTime = endTime;
        this.energyLevelStart = energyLevelStart;
        this.energyLevelRateOfChangePerHour = energyLevelRateOfChangePerHour;
    }

    public getEnergyAtTime(timeToCheck: moment.Moment): number {
        if (timeToCheck.isSameOrAfter(this.startTime) && timeToCheck.isSameOrBefore(this.endTime)) {
            const msDiff: number = timeToCheck.diff(this.startTime, 'milliseconds');
            const msPerHour = 3600000;
            const energyDiff = (msDiff/msPerHour) * this.energyLevelRateOfChangePerHour;
            const currentEnergyLevel = energyDiff + this.energyLevelStart;
            // console.log("energyDiff, currentEnergyLevel", energyDiff, currentEnergyLevel)
            return currentEnergyLevel;
        } else {
            console.log('Error:  timeToCheck is not in range ')
        }
        return null;
    }

    public getEnergyLevelAtTime(timeToCheck: moment.Moment): DaybookEnergyLevel {
        if (timeToCheck.isSameOrAfter(this.startTime) && timeToCheck.isSameOrBefore(this.endTime)) {
            const hoursDiff: number = timeToCheck.diff(this.startTime, 'hours');
            // console.log('Hours diff is : ' + hoursDiff);
            const energyDiff = hoursDiff * this.energyLevelRateOfChangePerHour;
            const currentEnergyLevel = energyDiff + this.energyLevelStart;

            if (currentEnergyLevel > 0 && currentEnergyLevel <= 0.25) {
                return DaybookEnergyLevel.Low;
            } else if (currentEnergyLevel > 0.25 && currentEnergyLevel <= 0.75) {
                return DaybookEnergyLevel.Medium;
            } else if (currentEnergyLevel > 0.75 && currentEnergyLevel <= 1) {
                return DaybookEnergyLevel.High;
            } else {
                console.log('Error with mental energy level numeric value: ' + currentEnergyLevel);
            }
        } else {
            console.log('Error:  timeToCheck is not in range ')
        }
        return null;
    }


}
