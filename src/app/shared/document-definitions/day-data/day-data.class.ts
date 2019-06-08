
import * as moment from 'moment';
import { DayDataActivityDataItem } from './data-properties/activity-data-item.class';
import { DayDataTaskItem } from './data-properties/task-data.interface';
import { DayDataTimelogEntryDataItem } from './data-properties/timelog-entry-data.interface';
import { DayDataNotebookEntry } from './data-properties/day-data-notebook-entry.interface';

import { DailyTaskListItem } from '../../tools/tool-components/dtcl-tool/daily-task-list-item.class';
import { Subject, Observable } from 'rxjs';



export class DayData {

    public get httpCreate(): any {
        return {
            userId: this.userId,
            dateYYYYMMDD: this.dateYYYYMMDD,
            activityData: this.activityData,
            dailyTaskListItems: this.dailyTaskListItemsHttpReq,
            taskData: this._taskData,
            timelogEntryData: this._timelogEntryData
        }
    }
    public get httpUpdate(): any {
        return {
            id: this.id,
            userId: this.userId,
            dateYYYYMMDD: this.dateYYYYMMDD,
            activityData: this.activityData,
            dailyTaskListItems: this.dailyTaskListItemsHttpReq,
            taskData: this._taskData,
            timelogEntryData: this._timelogEntryData
        }
    }
    public get httpDelete(): any {
        return {
            id: this.id,
        }
    }



    id: string;
    userId: string;



    private _date: moment.Moment;
    public get date(): moment.Moment {
        return moment(this._date);
    }

    dateYYYYMMDD: string;

    constructor(id: string, userId: string, dateYYYYMMDD: string) {
        this.id = id;
        this.userId = userId;
        this._date = moment(dateYYYYMMDD).hour(0).minute(0).second(0).millisecond(0);
        this.dateYYYYMMDD = dateYYYYMMDD;
    }


    private _activityData: DayDataActivityDataItem[] = [];
    private _dailyTaskListItems: DailyTaskListItem[] = [];
    private _taskData: DayDataTaskItem[] = [];
    private _timelogEntryData: DayDataTimelogEntryDataItem[] = [];
    private _notebookEntries: DayDataNotebookEntry[] = []; 

    private _configuration: any = {
        "activityDataConfigured": false,
        "dailyTaskListItemsConfigured": false,
        "taskDataConfigured":false,
        "timelogEntryDataConfigured":false,
    }
    public get isFullyConfigured(): boolean{
        let isConfigured: boolean = true;
        if(this._configuration["activityDataConfigured"] == false){
            isConfigured = false;
        }
        if(this._configuration["dailyTaskListItemsConfigured"] == false){
            isConfigured = false;
        }
        if(this._configuration["taskDataConfigured"] == false){
            isConfigured = false;
        }
        if(this._configuration["timelogEntryDataConfigured"] == false){
            isConfigured = false;
        }
        console.log("We are configured captain.");
        return isConfigured;
    }

    public set activityData(activityDataItems: DayDataActivityDataItem[]){
        this._activityData = activityDataItems;
        this._configuration["activityDataConfigured"] = true;
    }
    public get activityData(): DayDataActivityDataItem[] {
        return this._activityData;
    }
    public updateActivityData(activityDataItems: DayDataActivityDataItem[]){
        this._activityData = activityDataItems;
        this._configuration["activityDataConfigured"] = true;
        this.update();
    }

    public set dailyTaskListItems(dailyTaskListItems: DailyTaskListItem[]){
        this._dailyTaskListItems = dailyTaskListItems;
        this._configuration["dailyTaskListItemsConfigured"] = true;
    }
    public get dailyTaskListItems(): DailyTaskListItem[] {
        return this._dailyTaskListItems;
    }
    public updateDailyTaskListItems(dailyTaskListItems: DailyTaskListItem[]){
        this._dailyTaskListItems = dailyTaskListItems;
        this._configuration["dailyTaskListItemsConfigured"] = true;
        this.update();
    }

    public set taskData(taskData: DayDataTaskItem[]){
        this._taskData = taskData;
        this._configuration["taskDataConfigured"] = true;
    }
    public get taskData(): DayDataTaskItem[] {
        return this._taskData;
    }
    public updateTaskData(taskData: DayDataTaskItem[]){
        this._taskData = taskData;
        this._configuration["taskDataConfigured"] = true;
        this.update();
    }
    public get timelogEntryData(): DayDataTimelogEntryDataItem[]{
        return this._timelogEntryData;
    }
    public set timelogEntryData(data: DayDataTimelogEntryDataItem[]){
        this._timelogEntryData = data;
        this._configuration["timelogEntryDataConfigured"] = true;
    }
    public updateTimelogEntryData(timelogEntryData: DayDataTimelogEntryDataItem[]){
        this._timelogEntryData = timelogEntryData;
        this._configuration["timelogEntryDataConfigured"] = true;
        this.update();
    }


    public get allDTLItemsComplete(): boolean {
        if (this._dailyTaskListItems.length <= 0) {
            return false;
        }
        let allComplete: boolean = true;
        this._dailyTaskListItems.forEach((dtclItem) => {
            if (dtclItem.isComplete == false) {
                allComplete = false;
            }
        });
        return allComplete;
    }




    private _updateSubject$: Subject<boolean> = new Subject();
    public get updates$(): Observable<boolean> {
        return this._updateSubject$.asObservable();
    }


    private get dailyTaskListItemsHttpReq(): any {
        let items: any[] = [];
        this._dailyTaskListItems.forEach((dtlItem) => {
            items.push(dtlItem.httpRequestObject);
        })
        return items;
    }

    private update() {
        this._updateSubject$.next();
    }

}