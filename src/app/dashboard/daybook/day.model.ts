import { Objective } from "./objectives/objective.model";
import * as moment from 'moment';

export class Day{

    
    /*
        the Day object is one that has properties and other objects that are part of every day.

        for example, 
        -schedule template
        -daily task list (brush teeth, vitamins, etc.)
        -primary objective (the one thing to do every day)
        -


    */
   
    id: string;
    userId: string;
    // private _dateISO: string;
    // public get dateISO(): string{ 
    //     return this._dateISO;
    // }

    private _primaryObjective: Objective
    public get primaryObjective(): Objective { 
        return this._primaryObjective;
    }
    public set primaryObjective(objective: Objective){
        this._primaryObjective = objective;
    }

    private _date: moment.Moment;
    public get date(): moment.Moment{
        return moment(this._date);
    }

    constructor(id: string, userId: string, date: moment.Moment, primaryObjective: Objective){
        this.id = id;
        this.userId = userId;
        this._date = moment(date);
        // this._dateISO = moment(date).toISOString();

        this._primaryObjective = primaryObjective;
    }
}