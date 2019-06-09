import * as moment from 'moment';
import { RecurringTaskDefinition } from '../../document-definitions/recurring-task-definition/recurring-task-definition.class';
import { RecurringTasksService } from '../../document-definitions/recurring-task-definition/recurring-tasks.service';
import { Subject, Observable } from 'rxjs';


export interface DailyTaskListItem{
    recurringTaskId: string,
    completionDate: string,
}

export class DailyTaskList {

    public get httpCreate(): any{
        return {
            userId: this.userId,
            taskListItems: this.tasks,
            dateYYYYMMDD: this.dateYYYYMMDD,
        }
    }
    public get httpUpdate(): any{
        return {
            id: this.id,
            userId: this.userId,
            taskListItems: this.tasks,
            dateYYYYMMDD: this.dateYYYYMMDD,
        }
    }
    public get httpDelete(): any{
        return {
            id: this.id,
        }
    }

    id: string;
    userId: string;
    tasks: DailyTaskListItem[] = [];
    dateYYYYMMDD: string;

    private _recurringTasksService: RecurringTasksService;
    constructor(id: string, userId: string, tasks: DailyTaskListItem[], dateYYYYMMDD: string, private recurringTasksService: RecurringTasksService){ 
        this._recurringTasksService = recurringTasksService;


        this.id = id;
        this.userId = userId;
        this.dateYYYYMMDD = dateYYYYMMDD;
        this.tasks = tasks;

    }

    public recurringTask(taskItem: DailyTaskListItem): RecurringTaskDefinition{
        return this._recurringTasksService.getRecurringTaskById(taskItem.recurringTaskId);
    }

    public get date(): moment.Moment{
        return moment(this.dateYYYYMMDD).startOf("day");
    }


    public onClickCheckTask(item: DailyTaskListItem){
        if(item.completionDate){
            item.completionDate = "";
        }else{
            item.completionDate = moment().toISOString();
        }
        this.saveChanges();
    }

    public get allTasksComplete(): boolean{ 
        let allComplete: boolean = true;
        if(this.tasks.length == 0) {
            return false;
        }
        this.tasks.forEach((item)=>{
            if(!this.isComplete(item)){
                allComplete = false;
            }
        });
        return allComplete;
    }

    public isComplete(task: DailyTaskListItem): boolean{
        if(task.completionDate){
            return true;
        }else{
            return false;
        }
    }

    private _saveChanges$: Subject<boolean> = new Subject();
    public get saveChanges$(): Observable<boolean> {
        return this._saveChanges$.asObservable();
    }
    private saveChanges(){
        this._saveChanges$.next(true);
    }

}