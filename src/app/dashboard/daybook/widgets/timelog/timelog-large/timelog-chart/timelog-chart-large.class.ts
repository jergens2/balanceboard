import { TimelogWindow } from "./timelog-window.interface";
import { TimelogChartLargeRowItem } from "./timelog-chart-large-row-item/timelog-chart-large-row-item.class";
import * as moment from 'moment';
import { TimelogDayStructureItem } from "./timelog-day-structure-item.class";
import { DaybookDayItem } from "../../../../api/daybook-day-item.class";
import { Subject, Observable, timer, Subscription } from "rxjs";
import { DayStructureTimeOfDay } from "../../../../api/data-items/day-structure-time-of-day.enum";

export class TimelogChartLarge {

    minutesPerIncrement: number = 5;


    window: TimelogWindow
    chartGrid: any;


    chartRowItems: TimelogChartLargeRowItem[] = [];
    guidelineItems: any[] = [];
    dayStructureItems: TimelogDayStructureItem[] = [];

    constructor(timelogWindow: TimelogWindow, activeDay: DaybookDayItem) {
        this.window = timelogWindow;
        this.activeDay = activeDay;

        console.log("building timelog chart: " + this.activeDay.dateYYYYMMDD);
        console.log("timelog chart window: " + this.window.startTime.format("YYYY-MM-DD hh:mm a") + " to " + this.window.endTime.format("YYYY-MM-DD hh:mm a"))
        this.buildTimelogChartRowItems(this.window);

        this.initiateNowClock();
        // console.log("timelog window is: " + timelogWindow.startTime.format("h:mm a") + " to " + timelogWindow.endTime.format("h:mm a"));

        // let startTime: moment.Moment = moment(timelogWindow.startTime).subtract(1, "hour");
        // let endTime: moment.Moment = moment(timelogWindow.endTime).add(1, "hour");



        /**
         * 
         * 2019-08-25
         * 
         * Something to consider with regards to performance and method here
         * every time the timelog window changes, the whole chart is rebuilt essentially, all the timelogChartRowItems, of which there are a few hundred, so it does take a considerable number of milliseconds,
         * and so when scrolling it is very laggy feeling.
         * 
         * perhaps a mechanism to improve performance would be to, in stead of rebuilding every time, just make the changes.  not sure how difficult that would be but it might improve the performance.
         * for example, in stead of rebuilding all rows, just remove the ones from the one end, and add new ones to the other end.  in stead of doing... hundreds of operations, perhaps it would only be tens of operations.
         */


    }



    public wheelUp() {



        let newStartTime: moment.Moment = moment(this.window.startTime).add(1, "hour");
        let newEndTime: moment.Moment = moment(this.window.endTime).add(1, "hour");
        this.window = {
            windowStartTime: moment(newStartTime).subtract(1, "hour"),
            startTime: newStartTime,
            endTime: newEndTime,
            windowEndTime: moment(newEndTime).add(1, "hour"),
            size: this.window.size,
        }
        this.setWindow(this.window);
    }

    public wheelDown() {
        let newStartTime: moment.Moment = moment(this.window.startTime).subtract(1, "hour");
        let newEndTime: moment.Moment = moment(this.window.endTime).subtract(1, "hour");
        this.window = {
            windowStartTime: moment(newStartTime).subtract(1, "hour"),
            startTime: newStartTime,
            endTime: newEndTime,
            windowEndTime: moment(newEndTime).add(1, "hour"),
            size: this.window.size,
        }
        this.setWindow(this.window);
    }


    private setWindow(timelogWindow: TimelogWindow) {
        this.window = timelogWindow;
        this.initiateNowClock();
        this.buildTimelogChartRowItems(this.window);
        this.checkForDateChanges();
    }

    activeDay: DaybookDayItem
    public setActiveDay(activeDay: DaybookDayItem) {
        console.log("timelogchart: activeDay changed to: " + activeDay.dateYYYYMMDD)
        this.activeDay = activeDay;
    }

    private checkForDateChanges() {
        if (this.window.startTime.format("YYYY-MM-DD") != this.activeDay.dateYYYYMMDD) {
            if (moment(this.window.startTime).startOf("hour").isSame(moment(this.window.startTime).endOf("day").subtract(this.window.size / 2, "hours").startOf("hour"))) {
                this._timelogDateChanged$.next(this.window.startTime);
            }
        }
        if (this.window.endTime.format("YYYY-MM-DD") != this.activeDay.dateYYYYMMDD) {
            if (moment(this.window.endTime).startOf("hour").isSame(moment(this.window.endTime).startOf("day").add(this.window.size / 2, "hours").startOf("hour"))) {
                this._timelogDateChanged$.next(this.window.endTime);
            }
        }
    }
    private _timelogDateChanged$: Subject<moment.Moment> = new Subject();
    public get timelogDateChanged$(): Observable<moment.Moment> { return this._timelogDateChanged$.asObservable() };

    private buildTimelogChartRowItems(timelogWindow: TimelogWindow) {
        let timelogChartRowItems: TimelogChartLargeRowItem[] = [];
        let currentTime: moment.Moment = moment(timelogWindow.startTime);
        let currentRowIndex: number = 2;
        let timelogGuidelineItems: any[] = [];
        while (currentTime.isBefore(timelogWindow.endTime)) {
            let rowStart: moment.Moment = moment(currentTime);
            let rowEnd: moment.Moment = moment(currentTime).add(this.minutesPerIncrement, "minutes");
            if (moment(rowEnd).hour() == 0 && moment(rowEnd).minute() == 0) {
                rowEnd = moment(currentTime).endOf("day");
            }
            let newTimelogChartRowItem: TimelogChartLargeRowItem = new TimelogChartLargeRowItem(rowStart, rowEnd, currentRowIndex);
            let rowNgStyle: any = {
                "grid-column": "1 / -1",
                "grid-row": "" + currentRowIndex + " / span 1",
            }
            newTimelogChartRowItem.setNgStyle(rowNgStyle);
            timelogChartRowItems.push(newTimelogChartRowItem);
            currentTime = moment(currentTime).add(this.minutesPerIncrement, "minutes");
            currentRowIndex++;
        }
        currentTime = moment(timelogWindow.startTime).minute(0).second(0).millisecond(0);
        for (let hourIndex = 0; hourIndex <= timelogWindow.size; hourIndex++) {
            let ampm: string = "a";
            if (currentTime.hour() < 12) {
                ampm = "a";
            } else if (currentTime.hour() >= 12) {
                ampm = "p";
            }
            let lineColor: string = "rgb(220, 231, 235)";
            let dateCross: any = null;
            if (currentTime.hour() == 0) {
                lineColor = "rgb(166, 196, 207)";
                dateCross = {
                    previousDate: moment(currentTime).subtract(1, "millisecond").format("dddd, MMM DD, YYYY"),
                    nextDate: moment(currentTime).format("dddd, MMM DD, YYYY"),
                }
            }
            timelogGuidelineItems.push({
                label: moment(currentTime).format("h") + ampm,
                borderTopNgStyle: {
                    "border-top": "1px solid " + lineColor,
                },
                textColorNgStyle: {
                    "color": lineColor,
                },
                dateCross: dateCross
            });
            currentTime = moment(currentTime).add(1, "hours");
        }

        this.chartRowItems = timelogChartRowItems;
        this.guidelineItems = timelogGuidelineItems;

        this.chartGrid = {
            ngStyle: {
                "grid-template-rows": "8px repeat(" + this.chartRowItems.length + ", 1fr) 8px 9px",
            },
            windowSize: this.window.size,
            startTime: timelogWindow.windowStartTime,
            endTime: timelogWindow.windowEndTime,
        }

        this.buildDayStructureItems(timelogWindow);
    }



    private buildDayStructureItems(timelogWindow: TimelogWindow) {
        let dayStructureItems: TimelogDayStructureItem[] = [];
        let searchItems = [...this.activeDay.previousDay.dayStructureDataItems, ...this.activeDay.dayStructureDataItems, ...this.activeDay.followingDay.dayStructureDataItems];
        searchItems = searchItems.sort((item1, item2) => {
            if (item1.startTimeISO < item2.startTimeISO) {
                return -1;
            }
            if (item1.startTimeISO > item2.startTimeISO) {
                return 1;
            }
            return 0;
        });
        let inRangeItems = searchItems.filter((item) => {
            let crossesStart: boolean = moment(item.startTimeISO).isSameOrBefore(moment(timelogWindow.startTime)) && moment(item.endTimeISO).isAfter(moment(timelogWindow.startTime));
            let during: boolean = moment(item.startTimeISO).isSameOrAfter(moment(timelogWindow.startTime)) && moment(item.endTimeISO).isSameOrBefore(moment(timelogWindow.endTime));
            let crossesEnd: boolean = moment(item.startTimeISO).isBefore(moment(timelogWindow.endTime)) && moment(item.endTimeISO).isSameOrAfter(moment(timelogWindow.endTime));
            return (crossesStart || during || crossesEnd);
        });
        inRangeItems.forEach((templateItem) => {
            let newItem: TimelogDayStructureItem = new TimelogDayStructureItem(templateItem);
            newItem.ngStyle = {};
            newItem.ngClass = {};
            let crossesStart: boolean = moment(newItem.startTimeISO).isSameOrBefore(moment(timelogWindow.startTime)) && moment(newItem.endTimeISO).isAfter(moment(timelogWindow.startTime));
            let crossesEnd: boolean = moment(newItem.startTimeISO).isBefore(moment(timelogWindow.endTime)) && moment(newItem.endTimeISO).isSameOrAfter(moment(timelogWindow.endTime));
            let preceedsMidnight: boolean = moment(newItem.endTimeISO).isSame(moment(newItem.endTimeISO).endOf("day"));
            let followsMidnight: boolean = moment(newItem.startTimeISO).isSame(moment(newItem.startTimeISO).startOf("day"));

            newItem.border = "ALL";
            newItem.ngClass = ["day-structure-item-border-all"];

            if (crossesStart) {
                newItem.startTimeISO = timelogWindow.startTime.toISOString();
                newItem.border = "BOTTOM";
                newItem.ngClass = ["day-structure-item-border-bottom"];
            }
            if (crossesEnd) {
                newItem.endTimeISO = timelogWindow.endTime.toISOString();
                newItem.border = "TOP";
                newItem.ngClass = ["day-structure-item-border-top"];
            }
            if (preceedsMidnight) {
                newItem.border = "TOP";
                newItem.ngClass = ["day-structure-item-border-top"];
            }
            if (followsMidnight) {
                newItem.border = "BOTTOM";
                newItem.ngClass = ["day-structure-item-border-bottom"];
            }

            if(newItem.timeOfDay == DayStructureTimeOfDay.Morning){
                newItem.bodyLabel = moment(newItem.startTimeISO).format("dddd") + " Morning"; 
            }
            if(newItem.timeOfDay == DayStructureTimeOfDay.Afternoon){
                newItem.bodyLabel = moment(newItem.startTimeISO).format("dddd") + " Afternoon"; 
            }
            if(newItem.timeOfDay == DayStructureTimeOfDay.Evening){
                newItem.bodyLabel = moment(newItem.startTimeISO).format("dddd") + " Evening"; 
            }

            let gridRow = this.getGridRow(moment(newItem.startTimeISO), moment(newItem.endTimeISO));
            if (gridRow) {
                newItem.ngStyle["grid-row"] = gridRow;
                // newItem.ngStyle["background-color"] = templateItem.bodyBackgroundColor;
                dayStructureItems.push(newItem);
            } else {
                console.log("no grid row");
            }
        });

        this.dayStructureItems = dayStructureItems;
        // console.log("day structure items for timelog ", this.dayStructureItems)
    }



    private getGridRow(startTime: moment.Moment, endTime: moment.Moment): string {
        let gridRowStart: number = 0;
        let gridRowEnd: number = 0;
        this.chartRowItems.forEach((row) => {
            if (row.startTime.isSame((startTime))) {
                gridRowStart = row.gridRowStart;
                // console.log(""+row.startTime.format("YYYY-MM-DD hh:mm a") + " is the same start as " + startTime.format("YYYY-MM-DD hh:mm a"))
            }
            if (row.endTime.isSame((endTime))) {
                // console.log(""+row.endTime.format("YYYY-MM-DD hh:mm a") + " is the same end as " + endTime.format("YYYY-MM-DD hh:mm a"))
                gridRowEnd = row.gridRowStart + 1;

            }
        });
        if (!gridRowStart || !gridRowEnd) {
            console.log("Error with grid row", gridRowStart, gridRowEnd);
            console.log("Times: " + startTime.format("YYYY-MM-DD hh:mm a") + " , " + endTime.format("YYYY-MM-DD hh:mm a"))
            return null;
        } else {
            return "" + gridRowStart + " / " + gridRowEnd;
        }
    }


    private _nowTime: moment.Moment = moment();
    // private _wakeUpTime: moment.Moment = moment(this.activeDay.wakeUpTime);
    // private _bedTime: moment.Moment = moment(this.activeDay.bedTime)

    private _nowLine: any = null;
    private _wakeUpLine: any = null;
    private _bedTimeLine: any = null;

    private timerSubscription: Subscription = new Subscription();
    private initiateNowClock() {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = timer(0, 15000).subscribe((tick) => {
            this._nowTime = moment();
            if(moment(this._nowTime).isSameOrAfter(moment(this.window.startTime)) && moment(this._nowTime).isSameOrBefore(moment(this.window.endTime))){
                let durationMilliseconds = this.window.endTime.diff(this.window.startTime, "milliseconds");
                let percentage: number = (this._nowTime.diff(this.window.startTime, "milliseconds") / durationMilliseconds) * 100;
                this._nowLine = {
                    ngClass: {

                    },
                    ngStyle: {
                        "height":""+percentage.toFixed(2)+"%",
                    }
                }
            }else{
                this._nowLine = null;
            }

        });
    }


    public get nowLine(): any {
        return this._nowLine;
    }
    public get wakeUpLine(): any{
        return this._wakeUpLine;
    }
    public get bedTimeLine(): any{
        return this._bedTimeLine;
    }


}