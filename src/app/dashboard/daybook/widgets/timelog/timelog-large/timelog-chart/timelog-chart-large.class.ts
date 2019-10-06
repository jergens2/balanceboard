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

        // console.log("building timelog chart: " + this.activeDay.dateYYYYMMDD);
        // console.log("timelog chart window: " + this.window.startTime.format("YYYY-MM-DD hh:mm a") + " to " + this.window.endTime.format("YYYY-MM-DD hh:mm a"))
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
        let size: number = newEndTime.diff(newStartTime, "hours");
        this.window = {
            startTime: newStartTime,
            endTime: newEndTime,
            size: size,
        }
        this.setWindow(this.window);
    }

    public wheelDown() {
        let newStartTime: moment.Moment = moment(this.window.startTime).subtract(1, "hour");
        let newEndTime: moment.Moment = moment(this.window.endTime).subtract(1, "hour");
        let size: number = newEndTime.diff(newStartTime, "hours");
        this.window = {
            startTime: newStartTime,
            endTime: newEndTime,
            size: size,
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
        this.activeDay = activeDay;
        this.buildTimelogChartRowItems(this.window);
    }

    private checkForDateChanges() {
        if (this.window.startTime.format("YYYY-MM-DD") != this.activeDay.dateYYYYMMDD) {
            if (moment(this.window.startTime).startOf("hour").isSame(moment(this.window.startTime).endOf("day").subtract(this.window.size / 2, "hours").startOf("hour"))) {
                this._timelogDateChanged$.next(this.window.startTime);
            }
        } else if (this.window.endTime.format("YYYY-MM-DD") != this.activeDay.dateYYYYMMDD) {
            if (moment(this.window.endTime).startOf("hour").isSame(moment(this.window.endTime).startOf("day").add(this.window.size / 2, "hours").startOf("hour"))) {
                this._timelogDateChanged$.next(this.window.endTime);
            }
        }
    }
    private _timelogDateChanged$: Subject<moment.Moment> = new Subject();
    public get timelogDateChanged$(): Observable<moment.Moment> { return this._timelogDateChanged$.asObservable() };

    private buildTimelogChartRowItems(timelogWindow: TimelogWindow) {
        let startTime: moment.Moment = moment(timelogWindow.startTime);
        if (startTime.minute() != 0) {
            startTime = moment(startTime).startOf("hour");
        }
        let endTime: moment.Moment = moment(timelogWindow.endTime);
        if (endTime.minute() != 0) {
            endTime = moment(endTime).add(1, "hour").startOf("hour");
        }
        let size: number = moment(endTime).diff(startTime, "hours");

        let timelogChartRowItems: TimelogChartLargeRowItem[] = [];
        let currentTime: moment.Moment = moment(startTime);
        let currentRowIndex: number = 2;
        let timelogGuidelineItems: any[] = [];



        while (currentTime.isBefore(endTime)) {
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


        currentTime = moment(startTime)
        for (let hourIndex = 0; hourIndex <= size; hourIndex++) {
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

        let wakeupTime: moment.Moment;
        if (this.activeDay.sleepProfile.wakeupTimeISO) {
            wakeupTime = moment(this.activeDay.sleepProfile.wakeupTimeISO);
            if (wakeupTime.minute() % 5 != 0) {
                let mod = wakeupTime.minute() % 5;
                let minute = wakeupTime.minute() - mod;
                if (mod > (5 / 2)) mod = 5;
                else mod = 0;
                wakeupTime = moment(wakeupTime).minute(minute + mod);
            }
        } else {
            wakeupTime = moment(this.activeDay.dateYYYYMMDD).hour(7).minute(30);
        }
        let fallAsleepTime: moment.Moment;
        if (this.activeDay.sleepProfile.fallAsleepTimeISO) {
            fallAsleepTime = moment(this.activeDay.sleepProfile.fallAsleepTimeISO);
            if (fallAsleepTime.minute() % 5 != 0) {
                let mod = fallAsleepTime.minute() % 5;
                let minute = fallAsleepTime.minute() - mod;
                if (mod > (5 / 2)) mod = 5;
                else mod = 0;
                fallAsleepTime = moment(fallAsleepTime).minute(minute + mod);
            }
        } else {
            fallAsleepTime = moment(this.activeDay.dateYYYYMMDD).hour(22).minute(30);
        }

        timelogChartRowItems.forEach((rowItem) => {
            this.activeDay.timeDelineators.forEach((timeDelineator) => {
                if (rowItem.startTime.isSame(moment(timeDelineator))) {
                    rowItem.setAsDelineator();
                }
            });
            if (wakeupTime) {
                if (rowItem.startTime.hour() == wakeupTime.hour() && rowItem.startTime.minute() == wakeupTime.minute()) {
                    rowItem.setAsDelineator("Wake up");
                }
            }
            if (fallAsleepTime) {
                if (rowItem.startTime.hour() == fallAsleepTime.hour() && rowItem.startTime.minute() == fallAsleepTime.minute()) {
                    rowItem.setAsDelineator("Bed time");
                }
            }
        });


        this.chartRowItems = timelogChartRowItems;
        this.guidelineItems = timelogGuidelineItems;

        this.chartGrid = {
            ngStyle: {
                "grid-template-rows": "8px repeat(" + this.chartRowItems.length + ", 1fr) 8px 9px",
                // the 8 px at the start and the 8px at the end are basically margins/buffers for the chart time labels to have some space.
                // the extra 9px at the end is for when the bottom is 12am and the day changes and there is text there that needs space.
            },
            windowSize: this.window.size,
            startTime: startTime,
            endTime: endTime,
        }

        this.buildDayStructureItems(timelogWindow);
        this.updateChartRowItemSubscriptions();

        this.buildTimelogEntries()
    }

    private buildTimelogEntries() {
        let timelogEntries: any[] = [];




        this._timelogEntries = timelogEntries;
    }
    private _timelogEntries: any[] = [];
    public get timelogEntries(): any[] {
        return this._timelogEntries;
    }




    private _rowSubscriptions: Subscription[] = [];
    private updateChartRowItemSubscriptions() {
        this._rowSubscriptions.forEach((sub) => { sub.unsubscribe(); });
        this._rowSubscriptions = [];
        this.chartRowItems.forEach((rowItem) => {
            this._rowSubscriptions.push((rowItem.delineatorStatus$.subscribe((status: boolean) => {
                if (status === true) {
                    this._newDelineator$.next(rowItem);
                } else if (status === false) {
                    this._removeDelineator$.next(rowItem);
                }
            })));
        });
    }
    private _newDelineator$: Subject<TimelogChartLargeRowItem> = new Subject();
    public get newDelineator$(): Observable<TimelogChartLargeRowItem> {
        return this._newDelineator$.asObservable();
    }
    private _removeDelineator$: Subject<TimelogChartLargeRowItem> = new Subject();
    public get removeDelineator$(): Observable<TimelogChartLargeRowItem> {
        return this._removeDelineator$.asObservable();
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

            if (newItem.timeOfDay == DayStructureTimeOfDay.Morning) {
                newItem.bodyLabel = moment(newItem.startTimeISO).format("dddd") + " Morning";
            }
            if (newItem.timeOfDay == DayStructureTimeOfDay.Afternoon) {
                newItem.bodyLabel = moment(newItem.startTimeISO).format("dddd") + " Afternoon";
            }
            if (newItem.timeOfDay == DayStructureTimeOfDay.Evening) {
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


    private _nowLine: any = null;
    private _wakeUpLine: any = null;
    private _fallAsleepLine: any = null;

    private timerSubscription: Subscription = new Subscription();
    private initiateNowClock() {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = timer(0, 15000).subscribe((tick) => {
            this._nowTime = moment();
            let startTime: moment.Moment = moment(this.window.startTime).startOf("hour");
            let endTime: moment.Moment = moment(this.window.endTime);
            if (endTime.minute() != 0) {
                endTime = moment(endTime).add(1, "hour").startOf("hour");
            }
            if (moment(this._nowTime).isSameOrAfter(moment(startTime)) && moment(this._nowTime).isSameOrBefore(moment(endTime))) {
                let durationMilliseconds = endTime.diff(startTime, "milliseconds");
                let percentage: number = (this._nowTime.diff(startTime, "milliseconds") / durationMilliseconds) * 100;
                this._nowLine = {
                    ngClass: {

                    },
                    ngStyle: {
                        "height": "" + percentage.toFixed(2) + "%",
                    }
                }
            } else {
                this._nowLine = null;
            }
            if (moment(this.activeDay.wakeupTime).isSameOrAfter(moment(startTime)) && moment(this.activeDay.wakeupTime).isSameOrBefore(moment(endTime))) {
                let durationMilliseconds = endTime.diff(startTime, "milliseconds");
                let percentage: number = (this.activeDay.wakeupTime.diff(startTime, "milliseconds") / durationMilliseconds) * 100;
                this._wakeUpLine = {
                    ngClass: {

                    },
                    ngStyle: {
                        "height": "" + percentage.toFixed(2) + "%",
                    }
                }
            } else {
                this._wakeUpLine = null;
            }
            if (moment(this.activeDay.fallAsleepTime).isSameOrAfter(moment(startTime)) && moment(this.activeDay.fallAsleepTime).isSameOrBefore(moment(endTime))) {
                let durationMilliseconds = endTime.diff(startTime, "milliseconds");
                let percentage: number = (this.activeDay.fallAsleepTime.diff(startTime, "milliseconds") / durationMilliseconds) * 100;
                this._fallAsleepLine = {
                    ngClass: {

                    },
                    ngStyle: {
                        "height": "" + percentage.toFixed(2) + "%",
                    }
                }
            } else {
                this._fallAsleepLine = null;
            }
        });
    }


    public get nowLine(): any {
        return this._nowLine;
    }
    public get wakeUpLine(): any {
        return this._wakeUpLine;
    }
    public get fallAsleepLine(): any {
        return this._fallAsleepLine;
    }


}