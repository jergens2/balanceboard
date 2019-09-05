import * as moment from 'moment';
import { ScheduleRepitition } from './schedule-repitition.interface';
import { TimeUnit } from './time-unit.enum';
import { TimeUnitConverter } from './time-unit-converter.class';

export class ScheduleRepititionCalculator{
    public static repititionIsOnDay(repitition: ScheduleRepitition, dateYYYYMMDD: string): boolean{ 
        let startDate: moment.Moment = moment(repitition.startsOnDateTimeISO);
        if(moment(repitition.startsOnDateTimeISO).isAfter(moment(dateYYYYMMDD).endOf("day"))){
            return false;
        }
        if(startDate.format("YYYY-MM-DD") == dateYYYYMMDD){
            return true;
        }
        if(repitition.unit == TimeUnit.Day && repitition.value == 1){
            return true;
        }else{
            if(repitition.unit == TimeUnit.Millisecond || repitition.unit == TimeUnit.Second || repitition.unit == TimeUnit.Minute || repitition.unit == TimeUnit.Hour || repitition.unit == TimeUnit.Day || repitition.unit == TimeUnit.Week){
                let days: number = TimeUnitConverter.convert(repitition.value, repitition.unit, TimeUnit.Day);
                let daysDifference: number = moment(dateYYYYMMDD).diff(startDate, "days");
                if(daysDifference % days == 0){
                    return true;
                }
            }else{
                if(repitition.unit == TimeUnit.Month){
                    let monthsDifference: number = moment(dateYYYYMMDD).diff(startDate, "months");
                    if(monthsDifference % repitition.value == 0) {
                        return true;
                    }
                }else if(repitition.unit == TimeUnit.Year){
                    let yearsDifference: number = moment(dateYYYYMMDD).diff(startDate, "years");
                    if(yearsDifference % repitition.value == 0) {
                        return true;
                    }
                }
            } 

            return false;
        }
        
    }
}