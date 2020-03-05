import * as moment from 'moment';
import { DaybookEnergyItem } from './items/daybook-energy-item.class';
import { DaybookEnergyLevel } from './daybook-energy-level.enum';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { DaybookAvailabilityType } from './items/daybook-availability-type.enum';
import { SleepEntryItem } from '../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';

export class DaybookEnergyController {

    private _energyItems: DaybookEnergyItem[] = [];
    private _clock: moment.Moment;
    private _awakeToAsleepRatio: number;

    constructor(sleepEntryItems: SleepEntryItem[], awakeToAsleepRatio: number, clock: moment.Moment) {
        this._clock = moment(clock);
        this._awakeToAsleepRatio = awakeToAsleepRatio;
        this._buildEnergyItems(sleepEntryItems, awakeToAsleepRatio);
        this._runTest();
    }

    private _runTest(){
        let currentTime = moment(this._clock).startOf('day').subtract(24, 'hours');
        const endTime = moment(currentTime).add(3, 'days');
        while(currentTime.isSameOrBefore(endTime)){

            console.log("Energy at " + currentTime.format('YYYY-MM-DD hh:mm a') + " : " + this.getEnergyAtTime(currentTime))

            currentTime = moment(currentTime).add(30, 'minutes');
        }    }

    public get startTime(): moment.Moment { return moment(this._clock).startOf('day').subtract(24, 'hours'); }
    public get endTime(): moment.Moment { return moment(this._clock).startOf('day').add(48, 'hours'); }

    public getEnergyAtTime(timeToCheck: moment.Moment): number {
        // let energy: number;
        // const awakeHoursPerDay: number = (this._awakeToAsleepRatio * 24) / (this._awakeToAsleepRatio + 1);
        // const asleepHoursPerDay: number = 24 - awakeHoursPerDay;

        // const energyDecayPerHourAwake: number = 1 / awakeHoursPerDay;
        // const energyGainPerHourAsleep: number = 1 / asleepHoursPerDay;

        // const finalPoint = this._energyValuePoints[this._energyValuePoints.length - 1]

        // if (timeToCheck.isBefore(this._energyValuePoints[0].time)) {
        //     const flipTime: moment.Moment = moment(this._energyValuePoints[0].time).subtract(awakeHoursPerDay, 'hours');
        //     if (timeToCheck.isSameOrAfter(flipTime)) {
        //         const hoursDiff = moment(timeToCheck).diff(this._energyValuePoints[0].time, 'milliseconds') / (1000 * 60 * 60);
        //         energy = this._energyValuePoints[0].energyLevel - (hoursDiff * energyDecayPerHourAwake);
        //     } else if (timeToCheck.isBefore(flipTime)) {
        //         const hoursDiff = moment(timeToCheck).diff(flipTime, 'milliseconds') / (1000 * 60 * 60);
        //         energy = 0 + (hoursDiff * energyGainPerHourAsleep);
        //     }
        // } else if (timeToCheck.isAfter(finalPoint.time)) {
        //     const flipTime: moment.Moment = moment(finalPoint.time).add(asleepHoursPerDay, 'hours');
        //     if (timeToCheck.isSameOrBefore(flipTime)) {
        //         const hoursDiff = moment(timeToCheck).diff(finalPoint.time, 'milliseconds') / (1000 * 60 * 60);
        //         energy = finalPoint.energyLevel + (hoursDiff * energyGainPerHourAsleep);
        //     } else if (timeToCheck.isAfter(flipTime)) {
        //         const hoursDiff = moment(timeToCheck).diff(flipTime, 'milliseconds') / (1000 * 60 * 60);
        //         energy = 1 - (hoursDiff * energyDecayPerHourAwake);
        //     }
        // } else {
        //     let startIndex = 0;
        //     for (let i = 0; i < this._energyValuePoints.length; i++) {
        //         if(i < this._energyValuePoints.length-1){
        //             if (timeToCheck.isSameOrAfter(this._energyValuePoints[i].time) && timeToCheck.isBefore(this._energyValuePoints[i + 1].time)) {
        //                 startIndex = i;
        //                 i = this._energyValuePoints.length + 1;
        //             }
        //         }
        //     }
        //     const startItem = this._energyValuePoints[startIndex];
        //     let endItem: {time: moment.Moment, energyLevel: number};
        //     if(this._energyValuePoints.length >= startIndex+1){
        //         endItem = this._energyValuePoints[startIndex + 1];
        //     }else{
        //         console.log('Error calculating energy')
        //     }
            

        //     const gapHours = moment(endItem.time).diff(startItem.time, 'milliseconds') / (1000 * 60 * 60);
        //     const hoursDiff = moment(timeToCheck).diff(startItem.time, 'milliseconds') / (1000 * 60 * 60);
        //     const startEnergy = startItem.energyLevel;
        //     const endEnergy = endItem.energyLevel;
        //     const diffEnergy = endEnergy - startEnergy;
        //     let rateOfChange = (diffEnergy / gapHours);
        //     if(endEnergy > startEnergy){
        //         rateOfChange = rateOfChange * -1;
        //     }
        //     const energyAtTime = startEnergy + (hoursDiff * rateOfChange);
        //     energy = energyAtTime;
        // }
        return 0;
        // return energy;
    }


    private _buildEnergyItems(sleepEntryItems: SleepEntryItem[], awakeToAsleepRatio: number) {
        let energyItems: DaybookEnergyItem[] = [];
        energyItems = sleepEntryItems.map(item => item.getEnergyItem());
        this._energyItems = energyItems;
    }

}
