import { ValidatorFn, AbstractControl } from "@angular/forms";
import * as moment from 'moment';
import { TimeSegment } from "../time-segment.model";

export function startTimeValidator(latestTimeSegment: TimeSegment, startTime: moment.Moment, endTime: moment.Moment): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

        // start time cant be after end time.
        // start time cant be before calculatedStartTime

        // const forbidden = nameRe.test(control.value);
        const inValid = true;
        return inValid ? { 'invalidStartTime': { value: control.value } } : null;

    };
}

export function endTimeValidator(calculatedStartTime: moment.Moment, startTime: moment.Moment, endTime: moment.Moment): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

        // const forbidden = nameRe.test(control.value);
        const inValid = true;
        return inValid ? { 'invalidEndTime': { value: control.value } } : null;

    };
}