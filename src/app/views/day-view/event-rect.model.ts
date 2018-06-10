import { EventActivity } from "../../models/event-activity.model";

export class EventRect{
    public startTime: Date;
    public endTime: Date;
    public eventActivity: EventActivity;

    public x: number;  // Defines the x-axis start point
    public y: number;  // Defines the y-axis start point
    public width: number;  // Defines the x-axis end point
    public height: number;  // Defines the y-axis end point
    public rx: number;  
    public ry: number;  

    public style: {};
} 