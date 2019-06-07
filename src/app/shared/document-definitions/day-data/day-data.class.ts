
import * as moment from 'moment';
import { IActivityDataItem } from './activity-data-item.interface';
import { ITaskDataItem } from './task-data.interface';
import { ITimelogEntryDataItem } from './timelog-entry-data.interface';
import { DailyTaskChecklistItem } from '../../tools/tool-components/dtcl-tool/daily-task-checklist-item.class';
import { Subject, Observable } from 'rxjs';


export class DayData {

    public get httpCreate(): any {
        return {
            userId: this.userId,
            dateYYYYMMDD: this.dateYYYYMMDD,
            activityData: this.activityData,
            dailyTaskListItems: this.dailyTaskListItemsHttpReq,
            taskData: this.taskData,
            timelogEntryData: this.timelogEntryData
        }
    }
    public get httpUpdate(): any {
        return {
            id: this.id,
            userId: this.userId,
            dateYYYYMMDD: this.dateYYYYMMDD,
            activityData: this.activityData,
            dailyTaskListItems: this.dailyTaskListItemsHttpReq,
            taskData: this.taskData,
            timelogEntryData: this.timelogEntryData
        }
    }
    public get httpDelete(): any {
        return {
            id: this.id,
        }
    }



    id: string;
    userId: string;

    activityData: IActivityDataItem[] = [];
    dailyTaskListItems: DailyTaskChecklistItem[] = [];
    taskData: ITaskDataItem[] = [];
    timelogEntryData: ITimelogEntryDataItem[] = [];

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



    public get allDTLItemsComplete(): boolean {
        if (this.dailyTaskListItems.length <= 0) {
            return false;
        }
        let allComplete: boolean = true;
        this.dailyTaskListItems.forEach((dtclItem) => {
            if (dtclItem.isComplete == false) {
                allComplete = false;
            }
        });
        return allComplete;
    }

    public updateDailyTaskListItems(dtclItems: DailyTaskChecklistItem[]) {
        // console.log("Updating DTL items");
        this.dailyTaskListItems = dtclItems;
        this.update();
    }
    private update() {
        // console.log("Sending an update");
        this._updateSubject$.next();
    }

    private _updateSubject$: Subject<boolean> = new Subject();
    public get updates$(): Observable<boolean> {
        return this._updateSubject$.asObservable();
    }


    private get dailyTaskListItemsHttpReq(): any {
        let items: any[] = [];
        this.dailyTaskListItems.forEach((dtlItem) => {
            items.push(dtlItem.httpRequestObject);
        })
        return items;
    }

}