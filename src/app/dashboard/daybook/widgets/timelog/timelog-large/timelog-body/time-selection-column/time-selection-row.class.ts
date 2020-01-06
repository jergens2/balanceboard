import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

export class TimeSelectionRow {
    constructor(startTime: moment.Moment, endTime: moment.Moment, rowIndex: number) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.rowIndex = rowIndex;
        // this.instantiate();
        this._itemState = new ItemState(null);
    }


    private _itemState: ItemState;
    private _mouseIsDown = false;
    private _mouseDown$: Subject<boolean> = new Subject();
    private _mouseUp$: Subject<boolean> = new Subject();

    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public rowIndex: number;
    public isAvailable = true;
    public nextAvailabilityChange: moment.Moment;

    public get mouseIsDown(): boolean { return this._mouseIsDown; }
    public get mouseDown$(): Observable<boolean> { return this._mouseDown$.asObservable(); }
    public get mouseUp$(): Observable<boolean> { return this._mouseUp$.asObservable(); }
    public onMouseDown() {
        this._mouseIsDown = true;
        this._mouseDown$.next(true);
    }
    public onMouseUp() {
        this._mouseIsDown = false;
        this._mouseUp$.next(true);
    }



}