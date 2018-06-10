import { Moment } from "moment";

export class EventActivity{
    public id: string;
    public startTime: Moment;
    public endTime: Moment;
    public description: string;
    public category: string;

    constructor(id: string, startTime: Moment, endTime: Moment, description: string, category: string){
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
        this.category = category;
    }
}