export class DaybookWidget{

    private daybookWidgetType: DaybookWidgetType;
    constructor(dayBookWidgetType: DaybookWidgetType, isLarge: boolean){
        if(isLarge){
            this.expand();
        }else{
            this.shrink();
        }

    }

    public shrink(){
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