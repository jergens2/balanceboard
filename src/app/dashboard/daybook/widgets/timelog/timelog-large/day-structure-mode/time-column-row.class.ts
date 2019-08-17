import { BehaviorSubject, Observable, Subject } from "rxjs";
import { DayStructureChartLabelLine } from "./chart-label-line.class";
import * as moment from 'moment';

export class DayStructureTimeColumnRow {

    constructor(index: number, max: number) {
        this.index = index;
        this.max = max;
    }

    public index: number;
    public max: number;

    private _hasChartLabelLine: boolean = false;
    public setHasChartLabelLine(){
        this._hasChartLabelLine = true;
    }
    public setDoesNotHaveChartLabelLine(){
        this._hasChartLabelLine = false;
    }
    public get hasChartLabelLine(): boolean{
        return this._hasChartLabelLine;
    }


    public get chartLabel(): DayStructureChartLabelLine{
        let minutes: number = this.index * (1440 / this.max);
        let startTime: moment.Moment = moment().startOf("day").add(minutes, "minutes");
        let endTime: moment.Moment = moment(startTime);
        let newChartLabel = new DayStructureChartLabelLine(startTime, endTime, "", "");
        newChartLabel.setAsTemporary();
        return newChartLabel;
    }
    public get startTime(): moment.Moment{
        //1440 minutes per day
        let increment: number = 1440 / this.max;
        return moment().startOf("day").add(this.index*increment, "minutes");
    }
    public get endTime(): moment.Moment{
        let increment: number = 1440 / this.max;
        return moment(this.startTime).add(increment, "minutes");
    }



    private _mouseDown$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public get mouseDown$(): Observable<boolean> {
        return this._mouseDown$.asObservable();
    }
    public onMouseDown() {
        if(this.hasChartLabelLine){
            this._mouseDown$.next(true);
        }
    }

    private _dragging$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    onMouseOverLine(){ 
        this._dragging$.next(true);
    }
    public get dragging$(): Observable<boolean>{
        return this._dragging$.asObservable();
    }
    private _mouseUp$: Subject<boolean> = new Subject();
    public onMouseUp(){
        this._dragging$.next(false);
        this._mouseDown$.next(false);
        this._mouseUp$.next(true);
    }
    public get mouseUp$(): Observable<boolean> { 
        return this._mouseUp$;
    }


    private _mouseOverTimeLabel$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    onMouseOverTimeLabel() {
        this._mouseOverTimeLabel$.next(true);
    }
    onMouseLeaveTimeLabel() {
        this._mouseOverTimeLabel$.next(false);
    }



    public get mouseOverTimeLabel(): boolean {
        return this._mouseOverTimeLabel$.getValue();
    }
    public get mouseOverTimeLabel$(): Observable<boolean>{
        return this._mouseOverTimeLabel$.asObservable();
    } 
}