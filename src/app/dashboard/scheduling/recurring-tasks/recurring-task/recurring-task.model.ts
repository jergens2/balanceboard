
import * as moment from 'moment';

export class RecurringTask{
    id: string;
    userId: string;

    name: string;
    frequencyHours: number;  //recurs every x number of hours
    
    startDate: moment.Moment;

    constructor(id: string, userId: string, name: string){
        this.id = id;
        this.userId = userId;
        this.name = name;
    }
}