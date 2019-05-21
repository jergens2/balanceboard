import * as moment from 'moment';
import { TaskPriority } from './task-priority.enum';


export class Task {


    private _id: string;
    private _userId: string;

    public title: string;
    private _priority: TaskPriority;
    private _groupCategory: string;

    private _hasDueDate: boolean = false;
    private _dueDate: moment.Moment;
    private _createdDate: moment.Moment;
    private _completionDate: moment.Moment;
    private _isComplete: boolean = false;
    private _isCompleteByDueDate: boolean = false;
    // private _isFailed: boolean = false;



    public get id(): string {
        return this._id;
    }
    public get userId(): string {
        return this._userId;
    }
    public get hasDueDate(): boolean {
        return this._hasDueDate;
    }

    public get priority(): TaskPriority {
        return this._priority;
    }

    public get groupCategory(): string {
        return this._groupCategory;
    }
    public get groupCategories(): string[] {
        let regex: RegExp = /:\w+/g;
        let matches: string[] = this._groupCategory.match(regex);
        return matches;
    }

    public get isComplete(): boolean {
        return this._isComplete;
    }
    public get isCompleteByDueDate(): boolean {
        return this._isCompleteByDueDate;
    }
    public markComplete(date: moment.Moment) {
        this._isComplete = true;
        this._completionDate = moment(date);
        if (moment(date).isBefore(this._dueDate)) {
            this._isCompleteByDueDate = true;
        } else {
            this._isCompleteByDueDate = false;
        }
    }

    public markIncomplete() {
        this._isComplete = false;
        this._completionDate = null;
        this._isCompleteByDueDate = null;
    }

    public get dueDate(): moment.Moment {
        return moment(this._dueDate);
    }
    public get createdDate(): moment.Moment {
        return moment(this._createdDate);
    }

    public get completionDate(): moment.Moment {
        return this._completionDate;
    }
    public get completionDateISO(): string {
        if (this._completionDate) {
            return this._completionDate.toISOString();
        }
        return "";
    }

    description: string;

    // durationRequirementMinutes: number = 0;


    constructor(id: string, userId: string, title: string, description: string, groupCategory: string, priority: TaskPriority, createdDate: moment.Moment, dueDate?: moment.Moment) {
        this._id = id;
        this._userId = userId;
        this.title = title;
        this.description = description;
        this._priority = priority;
        this._groupCategory = groupCategory;

        this._createdDate = moment(createdDate);

        if (dueDate) {
            this._hasDueDate = true;
            this._dueDate = dueDate;
        } else {
            this._hasDueDate = false;
        }

    }

}