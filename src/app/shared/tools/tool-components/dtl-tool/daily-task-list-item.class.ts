import * as moment from 'moment';
import { RecurringTaskDefinition } from '../../../document-definitions/recurring-task/recurring-task-definition.class';


export interface DailyTaskListItemInterface{
    recurringTaskId: string,
    completionDate: string,
}

export class DailyTaskListItem {

    private _recurringTask: RecurringTaskDefinition;
    constructor(recurringTask: RecurringTaskDefinition){ 
        this._recurringTask = recurringTask;
    }

    public get recurringTask(): RecurringTaskDefinition{
        return this._recurringTask;
    }
    public get recurringTaskId(): string{
        return this._recurringTask.id;
    }
    

    public markComplete(date: moment.Moment){
        this._isComplete = true;
        this._completionDate = moment(date);
    }
    public markIncomplete(){
        this._completionDate = null;
        this._isComplete = false;
    }

    private _isComplete: boolean = false;
    private _completionDate: moment.Moment = null;
    public get isComplete(): boolean{
        return this._isComplete;
    }
    public get completionDate(): moment.Moment{
        return this._completionDate;
    }

    public get httpRequestObject(): DailyTaskListItemInterface {

        let completionDateString: string = "";
        if(this._isComplete){
            completionDateString = this._completionDate.toISOString();
        }

        return {
            recurringTaskId: this.recurringTaskId,
            completionDate: completionDateString,
        };
    }
}