import { TimelogWindow } from "./timelog-window.interface";
import { TimelogChartLargeRowItem } from "./timelog-chart-large-row-item/timelog-chart-large-row-item.class";
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

        console.log("building timelog chart: " + this.activeDay.dateYYYYMMDD);
        console.log("timelog chart window: " + this.window.startTime.format("YYYY-MM-DD hh:mm a") + " to " + this.window.endTime.format("YYYY-MM-DD hh:mm a"))
        this.buildTimelogChartRowItems(this.window);

        // console.log("timelog window is: " + timelogWindow.startTime.format("h:mm a") + " to " + timelogWindow.endTime.format("h:mm a"));

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
        console.log("timelogchart: activeDay changed to: " + activeDay.dateYYYYMMDD)
        this.activeDay = activeDay;
    }

    private checkForDateChanges() {
        if (this.window.startTime.format("YYYY-MM-DD") != this.activeDay.dateYYYYMMDD) {
            if (moment(this.window.startTime).startOf("hour").isSame(moment(this.window.startTime).endOf("day").subtract(this.window.size / 2, "hours").startOf("hour")) ) {
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
        let currentTime: moment.Moment = moment(timelogWindow.windowStartTime);
        let currentRowIndex: number = 1;

        let timelogGuidelineItems: any[] = [];
        let timelogGuidelinesGridRowStart = 1;
        let timelogGuidelinesGridRowSpan = 1;


        while (currentTime.isBefore(timelogWindow.windowEndTime)) {
            if (currentTime.isSameOrAfter(timelogWindow.startTime) && currentTime.isSameOrBefore(timelogWindow.endTime)) {
                if (timelogGuidelinesGridRowStart == 1) {
                    timelogGuidelinesGridRowStart = currentRowIndex;
                }
                if (timelogGuidelinesGridRowStart > 10) {
                    timelogGuidelinesGridRowSpan++;
                }
                let ampm: string = "a";
                if (currentTime.isBefore(moment(currentTime).hour(12).minute(0).second(0).millisecond(0))) {
                    ampm = "a";
                } else {
                    ampm = "p";
                }
                if (currentTime.minute() == 0) {
                    let lineColor: string = "rgb(220, 231, 235)";
                    let dateCross: any = {};
                    if (currentTime.hour() == 0) {
                        lineColor = "rgb(166, 196, 207)";
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
                            "border-top": "1px solid "+lineColor,
                        },
                        textColorNgStyle: {
                            "color": lineColor,
                        },
                        dateCross: dateCross
                    });
                }
            }
            let rowStart: moment.Moment = moment(currentTime);
            let rowEnd: moment.Moment = moment(currentTime).add(this.minutesPerIncrement, "minutes");
            if(moment(rowEnd).hour() == 0 && moment(rowEnd).minute() == 0){
                
                rowEnd = moment(currentTime).endOf("day");
                console.log("its midnight.  setting to 11:59: " + rowEnd.format("YYYY-MM-DD hh:mm a"))
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
                "grid-template-rows": "8px repeat(" + this.chartRowItems.length + ", 1fr) 8px",
            },
            windowSize: this.window.size,
            startTime: timelogWindow.windowStartTime,
            endTime: timelogWindow.windowEndTime,
        }

        this.buildDayStructureItems(timelogWindow);
    }



    private buildDayStructureItems(timelogWindow: TimelogWindow) {
        // console.log("Building Day structure items for window: " , timelogWindow.startTime.format("YYYY-MM-DD hh:mm a"), timelogWindow.endTime.format("YYYY-MM-DD hh:mm a"))
        let dayStructureItems: TimelogDayStructureItem[] = [];

        // console.log("Building daystructure items for active date: " + this.activeDay.dateYYYYMMDD);
        // console.log("Previous Date: " + this.activeDay.previousDay.dateYYYYMMDD);
        // console.log("Following day: " + this.activeDay.followingDay.dateYYYYMMDD);
        let searchItems = [...this.activeDay.previousDay.substantialDayStructureDataItems, ...this.activeDay.substantialDayStructureDataItems, ...this.activeDay.followingDay.substantialDayStructureDataItems];
        searchItems = searchItems.sort((item1, item2)=>{
            if(item1.startTimeISO < item2.startTimeISO){
                return -1;
            }
            if(item1.startTimeISO > item2.startTimeISO){
                return 1;
            }
            return 0;
        });
        // console.log(this.activeDay.previousDay.dateYYYYMMDD + ": " , this.activeDay.previousDay.substantialDayStructureDataItems)
        // console.log(this.activeDay.dateYYYYMMDD + ": " ,this.activeDay.substantialDayStructureDataItems)
        // console.log(this.activeDay.followingDay.dateYYYYMMDD + ": " ,this.activeDay.followingDay.substantialDayStructureDataItems)
        
        // console.log("search items for 3 days is: " + searchItems.length)
        searchItems.forEach((item)=>{
            // console.log(item.startTimeISO)
        })
        let structureSearchItems = searchItems.filter((item)=>{
            return item.itemType == DayStructureDataItemType.StructureItem;
        });
        // console.log("of those, reduced down to type.StructureItem: " + structureSearchItems.length);

        let inRangeItems = structureSearchItems.filter((item) => {
            let crossesStart: boolean = moment(item.startTimeISO).isSameOrBefore(moment(timelogWindow.startTime)) && moment(item.endTimeISO).isAfter(moment(timelogWindow.startTime));
            let during: boolean = moment(item.startTimeISO).isSameOrAfter(moment(timelogWindow.startTime)) && moment(item.endTimeISO).isSameOrBefore(moment(timelogWindow.endTime));
            let crossesEnd: boolean = moment(item.startTimeISO).isBefore(moment(timelogWindow.endTime)) && moment(item.endTimeISO).isSameOrAfter(moment(timelogWindow.endTime));
            
            // if(crossesStart){
            //     // console.log("it crosses start" + moment(item.startTimeISO).format("YYYY-MM-DD hh:mm a"))
            // }  
            // if(during){
            //     // console.log("it crossed during" + moment(item.startTimeISO).format("YYYY-MM-DD hh:mm a"))
            // }
            // if(crossesEnd){
            //     console.log("it crossed end." + moment(item.startTimeISO).format("YYYY-MM-DD hh:mm a"))
            // }
            // if(!(crossesEnd || during || crossesStart)){
            //     console.log("ITS NOT IN THE FRAME FOOL")
            // }


            
            return (crossesStart || during || crossesEnd);
        });
        // console.log("of those, in range are: " + inRangeItems.length);
        // inRangeItems.forEach((item)=>{
        //     console.log(moment(item.startTimeISO).format("YYYY-MM-DD hh:mm a") + " to " + moment(item.endTimeISO).format("YYYY-MM-DD hh:mm a") + " - " + item.bodyLabel)
        // })
        // inRangeItems = inRangeItems.filter((item) => { return item.itemType == DayStructureDataItemType.StructureItem; });
        // console.log("inrange items", inRangeItems)
        inRangeItems.forEach((templateItem) => {
            let newItem: any = Object.assign({}, templateItem);
            let crossesStart: boolean = moment(newItem.startTimeISO).isSameOrBefore(moment(timelogWindow.startTime)) && moment(newItem.endTimeISO).isAfter(moment(timelogWindow.startTime));
            let during: boolean = moment(newItem.startTimeISO).isSameOrAfter(moment(timelogWindow.startTime)) && moment(newItem.endTimeISO).isSameOrBefore(moment(timelogWindow.endTime));
            let crossesEnd: boolean = moment(newItem.startTimeISO).isBefore(moment(timelogWindow.endTime)) && moment(newItem.endTimeISO).isSameOrAfter(moment(timelogWindow.endTime));
            if (crossesStart) {
                newItem.startTimeISO = timelogWindow.startTime.toISOString();
                // newItem.ngStyle = {
                //     "border-left": "1px solid gray",
                //     "border-right": "1px solid gray",
                //     "border-bottom": "1px solid gray",
                // };
            }
            else if (crossesEnd) {
                newItem.endTimeISO = timelogWindow.endTime.toISOString();
                // newItem.ngStyle = {
                //     "border-left": "1px solid gray",
                //     "border-right": "1px solid gray",
                //     "border-top": "1px solid gray",
                // };
            } else {
                // newItem.ngStyle = {
                //     "border": "1px solid gray"
                // };
            }
            newItem.ngStyle = {};
            let gridRow = this.getGridRow(moment(newItem.startTimeISO), moment(newItem.endTimeISO));
            if (gridRow) {
                newItem.ngStyle["grid-row"] = gridRow;
                newItem.ngStyle["background-color"] = templateItem.bodyBackgroundColor;
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
                gridRowEnd = row.gridRowStart+1;
                
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

}