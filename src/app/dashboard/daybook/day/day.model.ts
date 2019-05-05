
import * as moment from 'moment';
import { IActivityDataItem } from './activity-data-item.interface';
import { IDailyTaskListDataItem } from './daily-task-list-data-item.interface';
import { ITaskDataItem } from './task-data.interface';
import { ITimeSegmentDataItem } from './time-segment-data.interface';

export class Day{


    /*

     userId: req.body.userId,
        dateYYYYMMDD: req.body.dateYYYYMMDD,
        activityData: req.body.activityData,
        dailyTaskListData: req.body.dailyTaskListData,
        taskData: req.body.taskData,
        timeSegmentData: req.body.timeSegmentData


    */

   
    id: string;
    userId: string;

    activityData: IActivityDataItem[] = [];
    dailyTaskListData: IDailyTaskListDataItem[] = [];
    taskData: ITaskDataItem[] = [];
    timeSegmentData: ITimeSegmentDataItem[] = [];

    private _date: moment.Moment;
    public get date(): moment.Moment{
        return moment(this._date);
    }

    dateISO: string;

    constructor(id: string, userId: string, dateISO: string){
        this.id = id;
        this.userId = userId;
        this._date = moment(dateISO).hour(0).minute(0).second(0).millisecond(0);
        this.dateISO = dateISO;
    }
}