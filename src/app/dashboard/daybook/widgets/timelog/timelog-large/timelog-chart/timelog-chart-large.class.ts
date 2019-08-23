import { TimelogWindow } from "./timelog-window.interface";
import { TimelogChartLargeRowItem } from "./timelog-chart-item/timelog-chart-large-row-item.class";
import * as moment from 'moment';
import { TimelogDayStructureItem } from "./timelog-day-structure-item.interface";
import { DaybookDayItem } from "../../../../api/daybook-day-item.class";
import { DayStructureDataItemType } from "../../../../api/data-items/day-structure-data-item-type.enum";
import { Subject, Observable } from "rxjs";

export class TimelogChartLarge {

    minutesPerIncrement: number = 5;


    window: TimelogWindow
    chartGrid: any;
    guidelinesBorderRightNgStyle: any;
    guidelinesNgStyle: any;

    chartRowItems: TimelogChartLargeRowItem[] = [];
    guidelineItems: any[] = [];
    dayStructureItems: TimelogDayStructureItem[] = [];

    constructor(timelogWindow: TimelogWindow, activeDay: DaybookDayItem) {
        this.window = timelogWindow;
        this.activeDay = activeDay;

        this.buildTimelogChartRowItems(this.window);
        
        console.log("timelog window is: " + timelogWindow.startTime.format("h:mm a") + " to " + timelogWindow.endTime.format("h:mm a"));

        // let startTime: moment.Moment = moment(timelogWindow.startTime).subtract(1, "hour");
        // let endTime: moment.Moment = moment(timelogWindow.endTime).add(1, "hour");






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
        this.buildTimelogChartRowItems(this.window);
        this.checkForDateChanges();
    }

    activeDay: DaybookDayItem
    public setActiveDay(activeDay: DaybookDayItem) {
        this.activeDay = activeDay;
    }

    private checkForDateChanges(){
        if(this.window.startTime.format("YYYY-MM-DD") != this.activeDay.dateYYYYMMDD){
            if(this.window.startTime.isSameOrBefore(moment(this.window.startTime).endOf("day").subtract(this.window.size/2, "hours"))){
                this._timelogDateChanged$.next(this.window.startTime);
            }
        }
        if(this.window.endTime.format("YYYY-MM-DD") != this.activeDay.dateYYYYMMDD){
            if(this.window.endTime.isSameOrAfter(moment(this.window.endTime).startOf("day").add(this.window.size/2, "hours"))){
                this._timelogDateChanged$.next(this.window.endTime);
            }
        }
    }
    private _timelogDateChanged$: Subject<moment.Moment> = new Subject();
    public get timelogDateChanged$(): Observable<moment.Moment>{ return this._timelogDateChanged$.asObservable() };

    private buildTimelogChartRowItems(timelogWindow: TimelogWindow) {
        let timelogChartRowItems: TimelogChartLargeRowItem[] = [];
        let currentTime: moment.Moment = moment(timelogWindow.windowStartTime);
        let currentRowIndex: number = 1;

        let timelogGuidelineItems: any[] = [];
        let timelogGuidelinesGridRowStart = 0;
        let timelogGuidelinesGridRowSpan = 1;


        while (currentTime.isBefore(timelogWindow.windowEndTime)) {
            if (currentTime.isSameOrAfter(timelogWindow.startTime) && currentTime.isSameOrBefore(timelogWindow.endTime)) {
                if (timelogGuidelinesGridRowStart == 0) {
                    timelogGuidelinesGridRowStart = currentRowIndex;
                }
                if (timelogGuidelinesGridRowStart > 0) {
                    timelogGuidelinesGridRowSpan++;
                }
                let ampm: string = "a";
                if (currentTime.isBefore(moment(currentTime).hour(12).minute(0).second(0).millisecond(0))) {
                    ampm = "a";
                } else {
                    ampm = "p";
                }
                if (currentTime.minute() == 0) {
                    let lineColor: string = "1px solid rgb(220, 231, 235)";
                    let dateCross: any = {};
                    if (currentTime.hour() == 0) {
                        lineColor = "1px solid rgb(166, 196, 207)";
                        dateCross = {
                            previousDate: moment(currentTime).subtract(1, "millisecond").format("dddd, MMM DD, YYYY"),
                            nextDate: moment(currentTime).format("dddd, MMM DD, YYYY"),
                        }
                    }
                    
                    timelogGuidelineItems.push({
                        label: currentTime.format("h") + ampm,
                        ngStyle: {
                            "grid-column": "1 / span 1",
                            "grid-row": "" + currentRowIndex + " / span 1",
                        },
                        borderTopNgStyle: {
                            "border-top": lineColor,
                        },
                        dateCross: dateCross
                    });
                }
            }
            let newTimelogChartRowItem: TimelogChartLargeRowItem = new TimelogChartLargeRowItem(moment(currentTime), moment(currentTime).add(this.minutesPerIncrement, "minutes"), currentRowIndex);
            let rowNgStyle: any = {
                "grid-column": "1 / -1",
                "grid-row": "" + currentRowIndex + " / span 1",
            }
            newTimelogChartRowItem.setNgStyle(rowNgStyle);
            timelogChartRowItems.push(newTimelogChartRowItem);
            currentTime = moment(currentTime).add(this.minutesPerIncrement, "minutes");
            currentRowIndex++;
        }

        this.chartRowItems = timelogChartRowItems;

        this.guidelinesNgStyle = {
            "grid-row": "" + timelogGuidelinesGridRowStart + " / span " + timelogGuidelinesGridRowSpan + "",
        };
        this.guidelinesBorderRightNgStyle = {
            "grid-row": "" + timelogGuidelinesGridRowStart + " / span " + (timelogGuidelinesGridRowSpan - 2) + "",
        };
        this.guidelineItems = timelogGuidelineItems;

        this.chartGrid = {
            ngStyle: {
                "grid-template-rows": "repeat(" + this.chartRowItems.length + ", 1fr)",
            },
            windowSize: this.window.size,
            startTime: timelogWindow.windowStartTime,
            endTime: timelogWindow.windowEndTime,
        }

        this.buildDayStructureItems(timelogWindow);
    }



    private buildDayStructureItems(timelogWindow: TimelogWindow) {
        let dayStructureItems: TimelogDayStructureItem[] = [];

        let searchItems = [ ...this.activeDay.previousDay.substantialDayStructureDataItems, ...this.activeDay.substantialDayStructureDataItems, ...this.activeDay.followingDay.substantialDayStructureDataItems];
        searchItems = searchItems.filter((item)=>{
            return item.itemType == DayStructureDataItemType.StructureItem;
        });

        let inRangeItems = searchItems.filter((item) => {
            let crossesStart: boolean = moment(item.startTimeISO).isSameOrBefore(moment(timelogWindow.windowStartTime)) && moment(item.endTimeISO).isAfter(moment(timelogWindow.windowStartTime));
            let during: boolean = moment(item.startTimeISO).isSameOrAfter(moment(timelogWindow.windowStartTime)) && moment(item.endTimeISO).isSameOrBefore(moment(timelogWindow.windowEndTime));
            let crossesEnd: boolean = moment(item.startTimeISO).isBefore(moment(timelogWindow.windowEndTime)) && moment(item.endTimeISO).isSameOrAfter(moment(timelogWindow.windowEndTime));
            return crossesStart || during || crossesEnd;
        });
        // console.log("inrange items", inRangeItems)
        inRangeItems.forEach((templateItem) => {
            let newItem: any = Object.assign({}, templateItem);
            let crossesStart: boolean = moment(newItem.startTimeISO).isSameOrBefore(moment(timelogWindow.windowStartTime)) && moment(newItem.endTimeISO).isAfter(moment(timelogWindow.windowStartTime));
            let during: boolean = moment(newItem.startTimeISO).isSameOrAfter(moment(timelogWindow.windowStartTime)) && moment(newItem.endTimeISO).isSameOrBefore(moment(timelogWindow.windowEndTime));
            let crossesEnd: boolean = moment(newItem.startTimeISO).isBefore(moment(timelogWindow.windowEndTime)) && moment(newItem.endTimeISO).isSameOrAfter(moment(timelogWindow.windowEndTime));

            if (crossesStart) {
                newItem.startTimeISO = timelogWindow.windowStartTime.toISOString();
                newItem.ngStyle = {
                    "border-left": "1px solid gray",
                    "border-right": "1px solid gray",
                    "border-bottom": "1px solid gray",
                };
            }
            if (crossesEnd) {
                newItem.endTimeISO = timelogWindow.windowEndTime.toISOString();
                newItem.ngStyle = {
                    "border-left": "1px solid gray",
                    "border-right": "1px solid gray",
                    "border-top": "1px solid gray",
                };
            } else {
                newItem.ngStyle = {
                    "border": "1px solid gray"
                };
            }
            newItem.ngStyle["grid-row"] = this.getGridRow(moment(newItem.startTimeISO), moment(newItem.endTimeISO));
            newItem.ngStyle["background-color"] = templateItem.bodyBackgroundColor;

            dayStructureItems.push(newItem);
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
            }
            if (row.endTime.isSame((endTime))) {
                gridRowEnd = row.gridRowStart+1;
            }
        });
        if (!gridRowStart || !gridRowEnd) {
            console.log("Error with grid row", gridRowStart, gridRowEnd);
            return null;
        } else {
            return "" + gridRowStart + " / " + gridRowEnd;
        }
    }

}