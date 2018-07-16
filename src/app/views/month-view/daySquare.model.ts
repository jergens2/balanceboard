import { EventActivity } from '../../models/event-activity.model';
import { Moment } from "moment";

export class DaySquare {

    public date: Moment;
    public svgPath: string;
    public style: {};
    public text_x: number;
    public text_y: number;
    public eventActivities: EventActivity[];

    /*
    constructor(
        date: Date,
        dateYYYYMMDD: string,
        svgPath: string,
        style: {}
    ){
        this.date = date;
        this.dateYYYYMMDD = dateYYYYMMDD;
        this.svgPath = svgPath;
        this.style = style;
    }
    */
}