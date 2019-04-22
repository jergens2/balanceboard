import { Task } from "../tasks/task.model";
import * as moment from 'moment';

export class Day{

    
    /*
        the Day object is one that has properties and other objects that are part of every day.

        for example, 
        -schedule template
        -daily task list (brush teeth, vitamins, etc.)
        -primary task (the one thing to do every day)
        -


    */
   
    id: string;
    userId: string;
    // private _dateISO: string;
    // public get dateISO(): string{ 
    //     return this._dateISO;
    // }

    private _primaryTask: Task = null;
    public get primaryTask(): Task { 
        return this._primaryTask;
    }
    public set primaryTask(task: Task){
        this._primaryTask = task;
    }

    private _date: moment.Moment;
    public get date(): moment.Moment{
        return moment(this._date);
    }

    constructor(id: string, userId: string, date: moment.Moment, primaryTask: Task){
        this.id = id;
        this.userId = userId;
        this._date = moment(date);
        // this._dateISO = moment(date).toISOString();

        /*
            To do in the future: remove primaryTask from constructor and use methods exclusively
        */
        this._primaryTask = primaryTask;
    }
}