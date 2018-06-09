import { Moment } from "moment";

export class EventActivity{
    public startTime: Moment;
    public endTime: Moment;
    public description: string;
    public category: string;

    constructor(startTime: Moment, endTime: Moment, description: string, category: string){
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
        this.category = category;
    }
}