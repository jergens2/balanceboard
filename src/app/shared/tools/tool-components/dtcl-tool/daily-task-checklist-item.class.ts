import * as moment from 'moment';

export class DailyTaskChecklistItem {

    constructor(recurringTaskId: string, name: string, completionDate: string){ 
        this.recurringTaskId = recurringTaskId;
        this.name = name;
        if(completionDate != ""){
            this.markComplete(moment(completionDate));
        }
    }

    public markComplete(date: moment.Moment){
        this._isComplete = true;
        this._completionDate = moment(date);
    }
    public markIncomplete(){
        this._completionDate = null;
        this._isComplete = false;
    }

    recurringTaskId: string;
    name: string;
    private _isComplete: boolean = false;
    private _completionDate: moment.Moment = null;
    public get isComplete(): boolean{
        return this._isComplete;
    }
    public get completionDate(): moment.Moment{
        return this._completionDate;
    }

    public get httpRequestObject(): any {

        let completionDateString: string = "";
        if(this._isComplete){
            completionDateString = this._completionDate.toISOString();
        }
        return {
            recurringTaskId: this.recurringTaskId,
            name: this.name,
            completionDate: completionDateString,
        };
    }
}