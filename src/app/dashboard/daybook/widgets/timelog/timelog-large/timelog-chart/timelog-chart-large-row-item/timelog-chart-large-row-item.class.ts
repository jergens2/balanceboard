import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';

export class TimelogChartLargeRowItem{
    
    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    gridRowStart: number = 0;
    
    constructor(startTime: moment.Moment, endTime: moment.Moment, gridRowStart: number) {
        this._startTime = moment(startTime);
        this._endTime = moment(endTime);
        this.gridRowStart = gridRowStart;
    }

    public get startTime(): moment.Moment{
        return moment(this._startTime);
    }
    public get endTime(): moment.Moment{
        return moment(this._endTime);
    }

    private _ngStyle: any;
    public setNgStyle(style: any){
        this._ngStyle = style;
    }
    public get ngStyle(): any{
        return this._ngStyle;
    }


    private _mouseIsOver: boolean = false;
    public onMouseEnter(){
        this._mouseIsOver = true;
    }
    public onMouseLeave(){
        this._mouseIsOver = false;
    }
    public get mouseIsOver(): boolean{
        return this._mouseIsOver;
    }
    

    private _mouseIsOverDelineator: boolean = false
    public get mouseIsOverDelineator(): boolean{
        return this._mouseIsOverDelineator;
    }
    public onMouseEnterNewDelineator(){
        this._mouseIsOverDelineator = true;
    }
    public onMouseLeaveNewDelineator(){
        this._mouseIsOverDelineator = false;
    }
    public onClickNewDelineator(){
        this._isDelineator = true;    
        this._delineatorStatus$.next(true);
    }
    public removeDelineator(){
        this._isDelineator = false;
        this._delineatorStatus$.next(false);
    }
    public setAsDelineator(label?: string){
        this._isDelineator = true;
        if(label){
            this._delineatorLabel = label;
        }
    }
    private _delineatorLabel: string = "";
    public get delineatorLabel(): string{ return this._delineatorLabel; }
    
    private _isDelineator: boolean = false;
    public get isDelineator(): boolean{ return this._isDelineator; }

    private _delineatorStatus$: Subject<boolean> = new Subject();
    public get delineatorStatus$(): Observable<boolean>{ return this._delineatorStatus$.asObservable(); }
    

    // public onClick(){
    //     console.log(this.startTime.format("YYYY-MM-DD hh:mm a") + " to " + this.endTime.format("YYYY-MM-DD hh:mm a"))
    // }

}