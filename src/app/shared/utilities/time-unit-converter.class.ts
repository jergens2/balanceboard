import { TimeUnit } from "./time-unit.enum";

export class TimeUnitConverter {

    public static convertToString(timeUnit: TimeUnit, lowerCase?: boolean){
        if(timeUnit == TimeUnit.Day){
            if(lowerCase){
                return "day";
            }else{
                return "Day";
            }
        }else if(timeUnit == TimeUnit.Week){
            if(lowerCase){
                return "week";
            }else{
                return "Week";
            } 
        }else if(timeUnit == TimeUnit.Month){
            if(lowerCase){
                return "month";
            }else{
                return "Month";
            } 
        }else if(timeUnit == TimeUnit.Year){
            if(lowerCase){
                return "year";
            }else{
                return "Year";
            } 
        }else if(timeUnit == TimeUnit.Hour){
            if(lowerCase){
                return "hour";
            }else{
                return "Hour";
            } 
        }else if(timeUnit == TimeUnit.Minute){
            if(lowerCase){
                return "minute";
            }else{
                return "Minute";
            } 
        }
        else if(timeUnit == TimeUnit.Second){
            if(lowerCase){
                return "second";
            }else{
                return "Second";
            } 
        }
        else if(timeUnit == TimeUnit.Millisecond){
            if(lowerCase){
                return "millisecond";
            }else{
                return "Millisecond";
            } 
        }
    }

    public static convert(value: number, fromUnit: TimeUnit, toUnit: TimeUnit): number {
        /**
         * The Gregorian (western) solar calendar has on average 365.2425 days per year.
         */
        const averageDaysPerYear: number = 365.2425;
        const averageDaysPerMonth: number = averageDaysPerYear/12;

        function convertToMilliseconds(value: number, fromUnit: TimeUnit): number {
            if (fromUnit == TimeUnit.Millisecond) {
                return value;
            }
            else if (fromUnit == TimeUnit.Second) {
                return value * 1000;
            }
            else if (fromUnit == TimeUnit.Minute) {
                return (value * 1000 * 60);
            }
            else if (fromUnit == TimeUnit.Hour) {
                return (value * 1000 * 60 * 60);
            }
            else if (fromUnit == TimeUnit.Day) {
                return (value * 1000 * 60 * 60 * 24);
            }
            else if (fromUnit == TimeUnit.Week) {
                return (value * 1000 * 60 * 60 * 24 * 7);
            }
            else if (fromUnit == TimeUnit.Month) {
                return (value * 1000 * 60 * 60 * 24 * averageDaysPerMonth);
            }
            else if (fromUnit == TimeUnit.Year) {
                return (value * 1000 * 60 * 60 * 24 * averageDaysPerYear);
            }
        }

        let milliseconds: number = convertToMilliseconds(value, fromUnit);

        if (toUnit == TimeUnit.Millisecond) {
            return milliseconds;
        }
        else if (toUnit == TimeUnit.Second) {
            return milliseconds / 1000;
        }
        else if (toUnit == TimeUnit.Minute) {
            return milliseconds / (1000 * 60);
        }
        else if (toUnit == TimeUnit.Hour) {
            return milliseconds / (1000 * 60 * 60);
        }
        else if (toUnit == TimeUnit.Day) {
            return milliseconds / (1000 * 60 * 60 * 24);
        }
        else if (toUnit == TimeUnit.Week) {
            return milliseconds / (1000 * 60 * 60 * 24 * 7);
        }
        else if (toUnit == TimeUnit.Month) {
            return milliseconds / (1000 * 60 * 60 * 24 * averageDaysPerMonth);
        }
        else if (toUnit == TimeUnit.Year) {
            return milliseconds / (1000 * 60 * 60 * 24 * averageDaysPerYear);
        }
    }
}