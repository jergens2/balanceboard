import * as moment from 'moment';

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

    public onClick(){
        console.log(this.startTime.format("hh:mm a") + " to " + this.endTime.format("hh:mm a"))
    }

}