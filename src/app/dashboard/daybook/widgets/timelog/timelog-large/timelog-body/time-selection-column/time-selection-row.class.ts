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

    private _delineatorsStyle: any = {
        'grid-template-rows': "1fr",
    };
    private _delineators: { time: moment.Moment, ngStyle: any }[] = [];

    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public rowIndex: number;
    public isAvailable = true;
    public setDelineators(delineators: moment.Moment[]) {
        if (delineators.length > 0) {
            this._delineators = delineators.sort((d1, d2) => {
                if (d1.isBefore(d2)) { return -1; }
                else if (d1.isAfter(d2)) { return 1; }
                else { return 0; }
            }).map((item) => {
                return {
                    time: item,
                    ngStyle: {},
                }
            });
            this._buildDelineatorsStyle();
        }
    }
    public get delineators(): { time: moment.Moment, ngStyle: any }[] { return this._delineators; }

    public get delineatorsStyle(): any { return this._delineatorsStyle; }

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
        if (this._delineators.length === 1) {
            if (currentTime.isSame(this._delineators[0].time)) {
                this._delineators[0].ngStyle = { 'grid-row': '1 / span 1', };
                style = { 'grid-template-rows': '0% 100%', };
            } else if (this.endTime.isSame(this._delineators[0].time)) {
                this._delineators[0].ngStyle = { 'grid-row': '2 / span 1', };
                style = { 'grid-template-rows': '100% 0%', };
            }
        } else if (this._delineators.length > 1) {
            // console.log("Delineators.length == " + this._delineators.length)
            const percentages: number[] = [];

            for (let i = 0; i < this._delineators.length; i++) {
                if (currentTime.isSame(this._delineators[i].time)) {
                    percentages.push(0);
                    this._delineators[i].ngStyle = { 'grid-row':  percentages.length + ' / span 1', };
                } else if (currentTime.isBefore(this._delineators[i].time)) {
                    const diff = (this._delineators[i].time).diff(currentTime, 'milliseconds');
                    percentages.push( (diff/ this.diffMS) * 100);
                } else if (currentTime.isAfter(this._delineators[i].time)) {
                    // console.log('Error with delineators.')
                }
            
                currentTime = moment(this._delineators[i].time);
            }
            if(currentTime.isBefore(this.endTime)){
                const diff = this.endTime.diff(currentTime, 'milliseconds');
                percentages.push(  (diff/ this.diffMS) * 100)
            }
            
            // console.log("PERCENTAGES: ")
            let gridTemplateRows: string = "";
            percentages.forEach((percent) => {
                gridTemplateRows += percent.toFixed(3) + "% ";
                // console.log(percent.toFixed(3) + "% ")
            })
            // console.log("GRIDTEMPLATEROWS: " + gridTemplateRows)
            style = {
                'grid-template-rows': gridTemplateRows,
            };
        }

        this._delineatorsStyle = style;
    
        // console.log("this._style = " , this._delineatorsStyle);
        // if(this._delineators.length > 0){
        //     this._delineators.forEach((item)=>{
        //         console.log("Delinteator style: " +item.time.format('hh:mm a'), item.ngStyle)
        //     })
        // }

    }


}