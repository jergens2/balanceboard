import * as moment from 'moment';
import { Delineation } from './delineation.interface';


export class DayTemplate{

    get httpSave(): any{
        console.log("HttpSave()", {
            name: this.name,
            userId: this.userId,
            color: this.color,
            delineations: this.delineations,
        })
        return {
            name: this.name,
            userId: this.userId,
            color: this.color,
            delineations: this.delineations,
        }
    }
    get httpUpdate(): any{
        return {
            id: this.id,
            name: this.name,
            userId: this.userId,
            color: this.color,
            delineations: this.delineations,
        }
    }
    get httpDelete(): any{
        return {
            id: this.id,
        }
    }


    id: string;
    name: string; // can be anything, but basic ones will be "Weekend", "Work day", "School day", "Holiday", etc.
    userId: string;
    color:string = "#ffffff";


    delineations: Delineation[] = [];


    constructor(id: string, userId: string, name: string){
        this.id = id;
        this.userId = userId;
        this.name = name;
    }




}
