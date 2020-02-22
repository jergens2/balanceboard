import { Subject, Observable } from "rxjs";

export class DaybookWidget {

    constructor(dayBookWidgetType: DaybookWidgetType, isLarge?: boolean) {
        this._type = dayBookWidgetType;
        if (isLarge) { this.expand(); }
        else { this.minimize(); }
    }

    private _mouseOver: boolean = false;
    private _type: DaybookWidgetType;
    private _widgetSizeChanged$: Subject<string> = new Subject();
    private _isExpanded: boolean = false;
    private _ngClass: any = {};
    private _ngStyle: any = {};

    public get type(): DaybookWidgetType { return this._type; }
    public get isExpanded(): boolean {return this._isExpanded;}
    public get ngClass(): any {return this._ngClass;}
    public get ngStyle(): any {return this._ngStyle;}
    public get mouseOver(): boolean {return this._mouseOver;}

    public get widgetSizeChanged$(): Observable<string> {
        return this._widgetSizeChanged$.asObservable();
    }

    public minimize() {
        this._isExpanded = false;
        this._ngClass = {}
        this._ngStyle = {}
    }
    public expand() {
        this._isExpanded = true;
        this._ngClass = {}
        this._ngStyle = {}
    }

    public onMouseEnterWidget() {this._mouseOver = true;}
    public onMouseLeaveWidget() {this._mouseOver = false;}

    public onClickExpand() {
        // console.log("Expanding this widget:  EXPAND");
        this._widgetSizeChanged$.next("EXPAND");
        this._mouseOver = false;
    }
    public onClickMinimize() {
        // console.log("Minimizing this widget");
        this._widgetSizeChanged$.next("MINIMIZE");
    }

}

export enum DaybookWidgetType {
    TIMELOG = 'TIMELOG',
    DAILY_TASK_LIST = 'DAILY_TASK_LIST',
    CALENDAR = 'CALENDAR',
    SLEEP_PROFILE = 'SLEEP_PROFILE',
    
}