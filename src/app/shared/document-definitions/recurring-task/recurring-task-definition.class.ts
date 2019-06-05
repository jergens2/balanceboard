
import * as moment from 'moment';
import { RecurringTaskRepitition } from './recurring-task-form/rt-repititions/recurring-task-repitition.interface';


export class RecurringTaskDefinition{
    id: string;
    userId: string;

    name: string;


    groupIds: string[] = [];
    //can group into a grouping for example "Morning"

    activityTreeId: string;
    //can be related to an activityTreeId


    
    repititions: RecurringTaskRepitition[] = [];

    constructor(id: string, userId: string, name: string, repititions: RecurringTaskRepitition[]){
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.repititions = repititions;
    }
}




