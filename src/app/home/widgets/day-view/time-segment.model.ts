import { Moment } from 'moment';
export class TimeSegment{
    public dateTime: Moment;

    public path: string;
    public line_x1: number;  // Defines the x-axis start point
    public line_y1: number;  // Defines the y-axis start point
    public line_x2: number;  // Defines the x-axis end point
    public line_y2: number;  // Defines the y-axis end point


    public style: {};
    public text_x: number;
    public text_y: number;
    public text_string: string;
}