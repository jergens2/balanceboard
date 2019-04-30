
import * as moment from 'moment';
import { RecurringTaskTimeOfDay } from './recurring-task-time-of-day.enum';

export class RecurringTask{
    id: string;
    userId: string;

    name: string;
    frequencyDays: number;  //recurs every x number of hours
    timeOfDay: RecurringTaskTimeOfDay
    
    startDate: moment.Moment;

    constructor(id: string, userId: string, name: string, frequencyDays: number, timeOfDay: RecurringTaskTimeOfDay, startDate: moment.Moment){
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.frequencyDays = frequencyDays;
        this.timeOfDay = timeOfDay;
        this.startDate = moment(startDate);
    }
}