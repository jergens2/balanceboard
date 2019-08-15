import { Subject, Observable } from "rxjs";

export class DaybookWidget{

    private _daybookWidgetType: DaybookWidgetType;
    public get daybookWidgetType(): DaybookWidgetType{
        return this._daybookWidgetType;
    }
    constructor(dayBookWidgetType: DaybookWidgetType, isLarge: boolean){
        this._daybookWidgetType = this.daybookWidgetType;
        if(isLarge){
            this.expand();
        }else{
            this.minimize();
        }

    }

    public minimize(){
        this._isExpanded = false;
        this._ngClass = {

        }
        this._ngStyle = {

        }
    }
    public expand(){
        this._isExpanded = true;
        this._ngClass = {
            
        }
        this._ngStyle = {

        }
    }

    private _mouseOver: boolean = false;
    public get mouseOver(): boolean{
        return this._mouseOver;
    }
    public onMouseEnterWidget(){
        this._mouseOver = true;
    }
    public onMouseLeaveWidget(){
        this._mouseOver = false;
    }


    private _widgetSizeChanged$: Subject<string> = new Subject();
    public get widgetSizeChanged$(): Observable<string> {
        return this._widgetSizeChanged$.asObservable();
    } 
    public onClickExpand(){
        console.log("Expanding this widget:  EXPAND");
        this._widgetSizeChanged$.next("EXPAND");
        this._mouseOver = false;
    }
    public onClickMinimize(){
        console.log("Minimizing this widget");
        this._widgetSizeChanged$.next("MINIMIZE");
    }

    private _isExpanded: boolean = false;
    public get isExpanded(): boolean{
        return this._isExpanded;
    }
    private _ngClass: any = {};
    public get ngClass(): any{
        return this._ngClass;
    }
    private _ngStyle: any = {};
    public get ngStyle(): any{
        return this._ngStyle;
    }
}

export enum DaybookWidgetType{
    timelog = "Timelog",
    dailyTaskList = "DailyTaskList",
    calendar = "Calendar"
}