import * as moment from "moment";
import { Observable, Subject } from "rxjs";
import { NotebookEntry } from "../../notebook-entry/notebook-entry.class";

export class NotesDate {

    private _dateYYYYMMDD: string;
    private _notes: NotebookEntry[];

    private _wordCount: number;
    private _isBlankDay: boolean = false;
    private _isToday: boolean = false;

    private _isDragging: boolean = false;
    private _isActive: boolean = false;
    private _mouseDown$: Subject<boolean> = new Subject();
    private _mouseOver$: Subject<boolean> = new Subject();
    private _mouseUp$: Subject<boolean> = new Subject();

    private _scaleColorClass: string = '';
    private _ngClass: string[] = [];

    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get date(): moment.Moment { return moment(this.dateYYYYMMDD); }
    public get notes(): NotebookEntry[] { return this._notes; }
    public get notesCount(): number { return this.notes.length; }
    public get wordCount(): number { return this._wordCount; }

    public get isBlankDay(): boolean { return this._isBlankDay; }
    public get isToday(): boolean { return this._isToday; }

    public get isDragging(): boolean { return this._isDragging; }
    public get isActive(): boolean { return this._isActive; }
    public get mouseDown$(): Observable<boolean> { return this._mouseDown$.asObservable(); }
    public get mouseOver$(): Observable<boolean> { return this._mouseOver$.asObservable(); }
    public get mouseUp$(): Observable<boolean> { return this._mouseUp$.asObservable(); }

    public get scaleColorClass(): string { return this._scaleColorClass; }
    public get ngClass(): string[] { return this._ngClass; }

    constructor(dateYYYYMMDD: string, notes: NotebookEntry[], isBlankDay?: boolean) {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._notes = notes;
        this._isToday = moment().format('YYYY-MM-DD') === dateYYYYMMDD;
        let wordCount = 0;
        this._notes.forEach(note => wordCount += note.wordCount);
        this._wordCount = wordCount;

        if (isBlankDay === true) {
            this._isBlankDay = true;
        }
        if(this.isToday){
            this._ngClass.push('is-today');
        }
    }

    public setAsActive() { 
        this._isActive = false; 
        this._ngClass.push('is-active');
    }
    public setAsInactive() { 
        this._isActive = false; 
        const foundIndex = this._ngClass.findIndex(item => item === 'is-active');
        if (foundIndex >= 0) {
            this._ngClass.splice(foundIndex, 1);
        }
    }

    public startDragging() {
        this._isDragging = true;
        this._ngClass.push('is-dragging');
    }
    public stopDragging() {
        this._isDragging = false;
        const foundIndex = this._ngClass.findIndex(item => item === 'is-dragging');
        if (foundIndex >= 0) {
            this._ngClass.splice(foundIndex, 1);
        }
    }

    public onMouseDown() { this._mouseDown$.next(true); }
    public onMouseOver() { this._mouseOver$.next(true); }
    public onMouseUp() { this._mouseUp$.next(true); }

    public setScales(mostNotesPerDay: number, mostWordsPerDay: number) {
        const colorScaleClasses: string[] = [
            'day-color-scale-0',
            'day-color-scale-1',
            'day-color-scale-2',
            'day-color-scale-3',
            'day-color-scale-4',
            'day-color-scale-5',
            'day-color-scale-6',
        ];
        if (this.notesCount === 0) {
            this._scaleColorClass = colorScaleClasses[0];
        } else if (this.notesCount > 0) {
            const colorCount = colorScaleClasses.length - 1;
            const percentage = (this.notesCount / mostNotesPerDay) * 100;
            const index = Math.ceil((percentage * colorCount) / 100);
            this._scaleColorClass = colorScaleClasses[index];
            this._ngClass.push(this._scaleColorClass);
        }
    }
}