import { Moment } from "moment";

export class EventActivity{
    public id: string;
    public startTimeISO: string;
    public endTimeISO: string;
    public description: string;
    public category: string;

    constructor(id: string, startTimeISO: string, endTimeISO: string, description: string, category: string){
        this.id = id;
        this.startTimeISO = startTimeISO;
        this.endTimeISO = endTimeISO;
        this.description = description;
        this.category = category;
    }
}