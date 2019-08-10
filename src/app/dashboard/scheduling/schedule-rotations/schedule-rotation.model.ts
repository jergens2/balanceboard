import { DayTemplate } from "../day-templates/day-template.class";
import * as moment from 'moment';

export class ScheduleRotation{


    id: string;
    userId: string;

    dayTemplates: DayTemplate[] = [];
    startDateYYYYMMDD: string; // this is the date which you implement your rotation for the first time, presumably on an ongoing, indeterminate basis.

    constructor(startDateYYYYMMDD: string, dayTemplates: DayTemplate[]){
        this.startDateYYYYMMDD = startDateYYYYMMDD;
        this.dayTemplates = dayTemplates;
    }


}