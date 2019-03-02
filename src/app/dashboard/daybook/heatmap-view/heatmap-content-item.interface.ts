import * as moment from "moment";

export interface IHeatmapContentItem {

    startTime: moment.Moment;
    endTime: moment.Moment;

    style: any;
}