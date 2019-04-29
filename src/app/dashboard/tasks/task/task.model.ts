import * as moment from 'moment';
import { TaskPriority } from './task-priority.enum';


export class Task{


    id: string;
    userId: string;


    public title: string;
    priority: TaskPriority = TaskPriority.Normal;

    private _isComplete: boolean = false;
    private _isCompleteByDueDate: boolean = false;
    // private _isFailed: boolean = false;

    
    public get isComplete(): boolean{
        return this._isComplete;
    }
    public get isCompleteByDueDate(): boolean{ 
        return this._isCompleteByDueDate;
    }
    public markComplete(date: moment.Moment) {
        this._isComplete = true;
        this._completionDate = moment(date);
        if(moment(date).isBefore(this._dueDate)){
            this._isCompleteByDueDate = true;
        }else{
            this._isCompleteByDueDate = false;
        }
    }

    public markIncomplete(){
        this._isComplete = false;
        this._completionDate = null;
        this._isCompleteByDueDate = null;
    }

    public get dueDate(): moment.Moment{
        return moment(this._dueDate);
    }
    public get startDate(): moment.Moment{
        return moment(this._startDate);
    }
    private _dueDate: moment.Moment;
    private _startDate: moment.Moment;
    private _completionDate: moment.Moment;
    public get completionDate(): moment.Moment{
        return this._completionDate;
    }
    public get completionDateISO(): string{
        if(this._completionDate){
            return this._completionDate.toISOString();
        }
        return "";
    }

    description: string;

    // durationRequirementMinutes: number = 0;


    constructor(id: string, userId: string, title:string, description: string, startDate?: moment.Moment, dueDate?: moment.Moment){
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        if(startDate){
            this._startDate = moment(startDate);
        }      
        
        if(dueDate){
            this._dueDate = moment(dueDate);
        }
        
    }

}