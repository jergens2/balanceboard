import * as moment from 'moment';
import { DaybookEnergyItem } from './items/daybook-energy-item.class';
import { DaybookEnergyLevel } from './daybook-energy-level.enum';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { DaybookAvailabilityType } from './items/daybook-availability-type.enum';

export class DaybookEnergyController {

    private _energyItems: DaybookEnergyItem[] = [];

    constructor(daybookScheduleItems: TimeScheduleItem<DaybookAvailabilityType>[], awakeToAsleepRatio: number) {
        this._calculateSchedule(daybookScheduleItems, awakeToAsleepRatio);    

    }


    public getEnergyLevelAtTime(timeToCheck: moment.Moment): DaybookEnergyLevel {
        const foundItem = this._energyItems.find((item) => {
            return timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isBefore(item.endTime);
        });
        if (foundItem) {
            return foundItem.getEnergyLevelAtTime(timeToCheck);
        } else {
            console.log('Error: no energy item');
        }
    }
    public getEnergyAtTime(timeToCheck: moment.Moment): number {
        const foundItem = this._energyItems.find((item) => {
            return timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isBefore(item.endTime);
        });
        if (foundItem) { return foundItem.getEnergyAtTime(timeToCheck); }
        else { console.log('Error: no energy item'); }
    }



    private _calculateSchedule(daybookScheduleItems: TimeScheduleItem<DaybookAvailabilityType>[], awakeToAsleepRatio: number) {
        let sleepValueItems = daybookScheduleItems.filter(item => item.value === DaybookAvailabilityType.SLEEP);
        const awakeHoursPerDay: number = (awakeToAsleepRatio * 24) / (awakeToAsleepRatio + 1);
        const asleepHoursPerDay: number = 24 - awakeHoursPerDay;

        const energyDecayPerHourAwake: number = 1 / awakeHoursPerDay;
        const energyGainPerHourAsleep: number = 1 / asleepHoursPerDay;

        // console.log("Energy decay per hour, gain per hour: " , energyDecayPerHourAwake, energyGainPerHourAsleep)

        let energyItems: DaybookEnergyItem[] = [];
        let currentEnergy = 0;

        let topValue: number = 0;
        let bottomValue: number = 0;

        daybookScheduleItems.forEach((item) => {
            let rate: number;
            if (item.value === DaybookAvailabilityType.SLEEP) {
                rate = energyGainPerHourAsleep;
            } else {
                rate = energyDecayPerHourAwake * -1;
            }
            if (currentEnergy < bottomValue) { bottomValue = currentEnergy; }
            if (currentEnergy > topValue) { topValue = currentEnergy; }
            
            const energyItem = new DaybookEnergyItem(item.startTime, item.endTime, currentEnergy, rate);
            energyItems.push(energyItem);

            currentEnergy = energyItem.getEnergyAtTime(item.endTime);
            // console.log("Rate is " + rate + " , current energy is : " + currentEnergy)
        });

        if (bottomValue < 0) {
            const offset = Math.abs(bottomValue);
            energyItems = energyItems.map((item) => {
                let newEnergy: number = item.energyLevelStart + offset;
                if(newEnergy > 1){
                    newEnergy = 1;
                }
                // if(item.energyLevelStart > 1){
                //     newEnergy = item.energyLevelStart - offset;
                // }else if(item.energyLevelStart < 0){
                //     newEnergy = item.energyLevelStart + offset;
                // }
                return new DaybookEnergyItem(item.startTime, item.endTime, newEnergy, item.energyLevelRateOfChangePerHour);
            });
        }else if(bottomValue > 0){
            console.log('Error with calculation: bottom value (' + bottomValue + ') is greater than 0');
        }


        // console.log(" ** Energy Items: ")
        // energyItems.forEach((item)=>{
        //     console.log("     "+ item.startTime.format("YYYY-MM-DD hh:mm a") + " - " + item.endTime.format('YYYY-MM-DD hh:mm a') + " --:   " + item.energyLevelStart);
        // })


        this._energyItems = energyItems;
    }

}
