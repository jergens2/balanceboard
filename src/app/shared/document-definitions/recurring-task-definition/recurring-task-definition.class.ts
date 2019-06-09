
import * as moment from 'moment';
import { RecurringTaskRepitition } from './recurring-task-form/rt-repititions/recurring-task-repitition.interface';
import { DailyTaskListItem } from '../../document-data/daily-task-list/daily-task-list.class';


export class RecurringTaskDefinition {

    public get httpSave(): any {
        return {
            userId: this.userId,
            name: this.name,
            groupIds: this.groupIds,
            activityTreeId: this.activityTreeId,
            repititions: this.repititions,
        }
    }
    public get httpUpdate(): any {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            groupIds: this.groupIds,
            activityTreeId: this.activityTreeId,
            repititions: this.repititions,
        }
    }
    public get httpDelete(): any {
        return {
            id: this.id,
        }
    }
    id: string;
    userId: string;

    name: string;


    groupIds: string[] = [];
    //can group into a grouping for example "Morning"

    activityTreeId: string = "";
    //can be related to an activityTreeId



    repititions: RecurringTaskRepitition[] = [];


    constructor(id: string, userId: string, name: string, repititions: RecurringTaskRepitition[]) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.repititions = repititions;
    }

    public hasTaskOnDate(date: moment.Moment): boolean {
        let hasTaskOnDate: boolean = false;
        // console.log("Has task on date? ", this.name);
        for (let repitition of this.repititions) {
            // console.log("   Repitition start date ISO:", repitition.startDate);
            let start: moment.Moment = moment(repitition.startDate);
            let end: moment.Moment = moment(date).endOf("day");
            // console.log("   Set the END date to ", end.toISOString(), end.format('YYYY-MM-DD'));
            if (end.isSameOrAfter(start)) {
                let diff: number = moment(end).diff(start, repitition.period);
                // console.log("   its a diff of ", diff, " ", repitition.period);
                if(diff%repitition.value == 0){
                    // console.log("    *Success: there is a DailyTask for " + this.name + " on date " + date.format("YYYY-MM-DD"))
                    hasTaskOnDate = true; 
                }
            }
        }
        if (!hasTaskOnDate) {
            // console.log("    *FAIL - no DailyTask for " + this.name + " (start date: " + this.repititions[0].startDate + ") on date " + date.format("YYYY-MM-DD"))
        }
        return hasTaskOnDate;
    }


}




