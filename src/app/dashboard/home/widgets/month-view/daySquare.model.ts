import { EventActivity } from '../../../models/event-activity.model';
import { Moment } from "moment";

export class DaySquare {

    public date: Moment;
    public svgPath: string;
    public style: {};
    public text_x: number;
    public text_y: number;
    public eventActivities: EventActivity[];

}