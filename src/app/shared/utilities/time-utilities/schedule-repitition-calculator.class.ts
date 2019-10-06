import * as moment from 'moment';
// import { ScheduleRepitition } from './schedule-repitition.interface';
import { TimeUnit } from './time-unit.enum';
import { TimeUnitConverter } from './time-unit-converter.class';

export class ScheduleRepititionCalculator{
    // public static repititionIsOnDay(repitition: ScheduleRepitition, dateYYYYMMDD: string): boolean{ 
    //     // console.log("        Checking if repitition happens on date: ", dateYYYYMMDD, repitition);
    //     let startDate: moment.Moment = moment(repitition.startsOnDateYYYYMMDD);
    //     if(moment(repitition.startsOnDateYYYYMMDD).isAfter(moment(dateYYYYMMDD).endOf("day"))){
    //         // console.log("        * Returning false because the repitition start time is after the date");
    //         return false;
    //     }
    //     if(startDate.format("YYYY-MM-DD") == dateYYYYMMDD){
    //         // console.log("        * Returning TRUE because the repitition is on the same date as start time");
    //         return true;
    //     }
    //     if(repitition.unit == TimeUnit.Day && repitition.value == 1){
    //         // console.log("        * Returning TRUE because it happens every day.");
    //         return true;
    //     }else{
    //         if(repitition.unit == TimeUnit.Millisecond || repitition.unit == TimeUnit.Second || repitition.unit == TimeUnit.Minute || repitition.unit == TimeUnit.Hour || repitition.unit == TimeUnit.Day || repitition.unit == TimeUnit.Week){
    //             let days: number = TimeUnitConverter.convert(repitition.value, repitition.unit, TimeUnit.Day);
    //             let daysDifference: number = moment(dateYYYYMMDD).diff(startDate, "days");
    //             if(daysDifference % days == 0){
    //                 // console.log("        * Returning TRUE because it repeats on this day.");
    //                 return true;
    //             }
    //         }else{
    //             if(repitition.unit == TimeUnit.Month){
    //                 let monthsDifference: number = moment(dateYYYYMMDD).diff(startDate, "months");
    //                 if(monthsDifference % repitition.value == 0) {
    //                     // console.log("        * Returning TRUE because it repeats on this day of the month");
    //                     return true;
    //                 }
    //             }else if(repitition.unit == TimeUnit.Year){
    //                 let yearsDifference: number = moment(dateYYYYMMDD).diff(startDate, "years");
    //                 if(yearsDifference % repitition.value == 0) {
    //                     // console.log("        * Returning TRUE because it repeats on this day of the year");
    //                     return true;
    //                 }
    //             }
    //         } 
    //         // console.log("        * Returning false because none of the conditions were true.");
    //         return false;
    //     }
        
    // }
}