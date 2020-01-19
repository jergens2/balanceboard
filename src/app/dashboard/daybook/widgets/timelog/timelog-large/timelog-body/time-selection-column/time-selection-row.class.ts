import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { TimelogDelineator } from '../../../timelog-delineator.class';
import { TimeSchedule } from '../../../../../../../shared/utilities/time-utilities/time-schedule.class';
import { TimeScheduleItem } from '../../../../../../../shared/utilities/time-utilities/time-schedule-item.class';

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

    private _drawDelineator: TimelogDelineator;

    private _delineatorStyle: any = { 'grid-template-rows': "1fr", };
    private _delineator: { time: moment.Moment, ngStyle: any } = null;

    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public rowIndex: number;
    public isAvailable = true;
    public setDelineator(delineator: moment.Moment) {
        if (delineator) {
            this._delineator = {
                time: delineator,
                ngStyle: {},
            }
        };
        this._buildDelineatorsStyle();
    }
    public get delineator(): { time: moment.Moment, ngStyle: any } { return this._delineator; }

    public get delineatorStyle(): any { return this._delineatorStyle; }

    public get diffMS(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }

    public get mouseIsDown(): boolean { return this._mouseIsDown; }
    public get mouseDown$(): Observable<boolean> { return this._mouseDown$.asObservable(); }
    public get mouseUp$(): Observable<boolean> { return this._mouseUp$.asObservable(); }

    public get drawDelineator(): TimelogDelineator { return this._drawDelineator; }

    public onDrawDelineator(newDelineator: TimelogDelineator) {
        // console.log("DRAWING THE DELINEATOR IN THE ROW")
        this._drawDelineator = newDelineator;
    }

    public onMouseDown() {
        this._mouseIsDown = true;
        this._mouseDown$.next(true);
    }
    public onMouseUp() {
        this._mouseIsDown = false;
        this._mouseUp$.next(true);
    }

    public reset() {
        this._drawDelineator = null;
    }




    private _buildDelineatorsStyle() {
        let style: any = {};
        let currentTime = moment(this.startTime);
        if (this._delineator) {
            if (currentTime.isSame(this._delineator.time)) {
                this._delineator.ngStyle = { 'grid-row': '1 / span 1', };
                style = { 'grid-template-rows': '0% 100%', };
            } else if (this.endTime.isSame(this._delineator.time)) {
                this._delineator.ngStyle = { 'grid-row': '2 / span 1', };
                style = { 'grid-template-rows': '100% 0%', };
            }
            this._delineatorStyle = style;
        }



        // console.log("this._style = " , this._delineatorsStyle);
        // if(this._delineators.length > 0){
        //     this._delineators.forEach((item)=>{
        //         console.log("Delinteator style: " +item.time.format('hh:mm a'), item.ngStyle)
        //     })
        // }

    }


}