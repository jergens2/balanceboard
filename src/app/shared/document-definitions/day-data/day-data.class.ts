
import * as moment from 'moment';
import { IActivityDataItem } from './activity-data-item.interface';
import { IDailyTaskListDataItem } from './daily-task-list-data-item.interface';
import { ITaskDataItem } from './task-data.interface';
import { ITimelogEntryDataItem } from './timelog-entry-data.interface';


export class DayData{


    /*

     userId: req.body.userId,
        dateYYYYMMDD: req.body.dateYYYYMMDD,
        activityData: req.body.activityData,
        dailyTaskListData: req.body.dailyTaskListData,
        taskData: req.body.taskData,
        timelogEntryData: req.body.timelogEntryData


    */

   
    id: string;
    userId: string;

    activityData: IActivityDataItem[] = [];
    dailyTaskListData: IDailyTaskListDataItem[] = [];
    taskData: ITaskDataItem[] = [];
    timelogEntryData: ITimelogEntryDataItem[] = [];

    private _date: moment.Moment;
    public get date(): moment.Moment{
        return moment(this._date);
    }

    dateYYYYMMDD: string;

    constructor(id: string, userId: string, dateYYYYMMDD: string){
        this.id = id;
        this.userId = userId;
        this._date = moment(dateYYYYMMDD).hour(0).minute(0).second(0).millisecond(0);
        this.dateYYYYMMDD = dateYYYYMMDD;
    }
}