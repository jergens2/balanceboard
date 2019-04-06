import { DayTemplate } from "./day-templates/day-template.model";
import * as moment from 'moment';

export class ScheduleRotation{

    daysCount: number;
    dayTemplates: DayTemplate[] = [];

    indeterminateStartDate: moment.Moment; // this is the date which you implement your rotation for the first time, presumably on an ongoing, indeterminate basis.

    constructor(startDate: moment.Moment, daysCount: number, dayTemplates: DayTemplate[]){
        this.indeterminateStartDate = moment(startDate);
        this.daysCount = daysCount;
        this.dayTemplates = dayTemplates;
    }

}