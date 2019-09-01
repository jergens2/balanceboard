import { TimeUnit } from "./time-unit.enum";

export class TimeUnitConverter {

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