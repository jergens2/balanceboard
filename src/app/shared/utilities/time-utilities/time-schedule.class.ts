import * as moment from 'moment';
import { TimeScheduleItem } from './time-schedule-item.class';


export class TimeSchedule {

    /**
     *  The TimeSchedule class is a class that keeps track of a congruous table of time, with some property associated with each block.
     *  Currently only performs this functionality for a single bool value property.
     */
    constructor(startTime: moment.Moment, endTime: moment.Moment) { this._reInitializeTimeSchedule(startTime, endTime); }
    protected _reInitializeTimeSchedule(startTime: moment.Moment, endTime: moment.Moment) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._fullScheduleItems = [new TimeScheduleItem(startTime, endTime, false)];
    }

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _fullScheduleItems: TimeScheduleItem[];

    public get startTime(): moment.Moment { return moment(this._startTime); }
    public get endTime(): moment.Moment { return moment(this._endTime); }


    public get fullScheduleItems(): TimeScheduleItem[] { return this._fullScheduleItems; }
    public getScheduleSlice(startTime: moment.Moment, endTime: moment.Moment): TimeScheduleItem[] {
        // console.log("   Finding slice: " + startTime.format('YYYY-MM-DD hh:mm a') + " to " + endTime.format('YYYY-MM-DD hh:mm a') ) 
        if (startTime.isSameOrAfter(this.startTime) && endTime.isSameOrBefore(this.endTime)) {
            // let slicedSchedule: TimeSchedule = new TimeSchedule(startTime, endTime);
            let foundSliceItems = this.fullScheduleItems.filter((item) => {
                let crossesStart = item.startTime.isSameOrBefore(startTime) && item.endTime.isAfter(startTime);
                let inside = item.startTime.isSameOrAfter(startTime) && item.endTime.isSameOrBefore(endTime);
                let crossesEnd = item.startTime.isBefore(endTime) && item.endTime.isAfter(endTime);
                return crossesStart || inside || crossesEnd;
            });
            if (foundSliceItems.length > 0) {
                let currentTime: moment.Moment = moment(startTime);
                let newTimeScheduleFullItems: TimeScheduleItem[] = [];
                for (let i = 0; i < foundSliceItems.length; i++) {
                    if (foundSliceItems[i].endTime.isSameOrBefore(endTime)) {
                        newTimeScheduleFullItems.push(new TimeScheduleItem(currentTime, foundSliceItems[i].endTime, foundSliceItems[i].hasValue));
                    } else if (foundSliceItems[i].endTime.isAfter(endTime)) {
                        newTimeScheduleFullItems.push(new TimeScheduleItem(currentTime, endTime, foundSliceItems[i].hasValue));
                    }
                    currentTime = foundSliceItems[i].endTime;
                }
                // slicedSchedule.setScheduleFromFullValues(newTimeScheduleFullItems);
                // console.log("Returning Sliced Schedule:");
                // slicedSchedule.fullScheduleItems.forEach((item) => {
                //     console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a'), item.hasValue)
                // })
                return newTimeScheduleFullItems;
            } else {
                console.log("No slice found.  returning empty schedule.")
                return [];
            }
        } else {
            console.log("No slice found.  returning empty schedule.")
            return [];
        }
    }
    public hasValueAtTime(timeToCheck: moment.Moment): boolean {
        if (this.fullScheduleItems.length > 0) {
            let foundItem = this._fullScheduleItems.find((item) => {
                return timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isSameOrBefore(item.endTime);
            });
            if (foundItem) {
                return foundItem.hasValue;
            } else {
                console.log(' Error:  could not find item in schedule.')
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Simply input all of the items that have value, 
     * and this method will populate the remaining, opposite-value, schedule items 
     * 
     * isPositive implies that the values provided all have positive value (true), and the remainder of time have negative value (false) .
     * !isPositive implies that the values provided all explicitly DO NOT HAVE value (false), and the remainder of time DOES HAVE value (true).
     * 
     * @param isPositive if setting values as positives then put true, if setting values as negatives then put false. Default case would be to put true;
     */
    public setScheduleFromSingleValues(valueItems: TimeScheduleItem[], isPositive: boolean) {
        // console.log("Setting schedule from values: " , valueItems)
        const setValue: boolean = isPositive;
        let fullScheduleItems: TimeScheduleItem[] = [];
        valueItems = valueItems.sort((item1, item2)=>{
            if(item1.startTime.isBefore(item2.startTime)){ return -1; }
            else if(item1.startTime.isAfter(item2.startTime)) { return 1; }
            else { return 0; }
        });
        if (valueItems.length > 0) {
            let currentTime = this.startTime;
            for (let i = 0; i < valueItems.length; i++) {
                const itemStart = valueItems[i].startTime;
                const itemEnd = valueItems[i].endTime;
                if (currentTime.isAfter(itemStart)) {
                    if (currentTime.isBefore(itemEnd)) {
                        fullScheduleItems.push(new TimeScheduleItem(currentTime, itemEnd, setValue));
                        // console.log("  POOSH: " , new TimeScheduleItem(currentTime, itemEnd, setValue))
                    }
                } else {
                    if (currentTime.isBefore(itemStart)) {
                        fullScheduleItems.push(new TimeScheduleItem(currentTime, itemStart, !setValue));
                        // console.log("  POOSH: " , new TimeScheduleItem(currentTime, itemStart, !setValue))
                    }
                    fullScheduleItems.push(valueItems[i]);
                    // console.log("  POOSH: " , valueItems[i])
                }
                currentTime = itemEnd;
            }
            if (currentTime.isBefore(this.endTime)) {
                fullScheduleItems.push(new TimeScheduleItem(currentTime, this.endTime, !setValue));
                // console.log("  POOSH: " , new TimeScheduleItem(currentTime, this.endTime, !setValue))
            } else if (currentTime.isAfter(this.endTime)) {
                console.log('Error with items');
            }
            // console.log("full schedule: " , fullScheduleItems)
        } else {
            fullScheduleItems = [new TimeScheduleItem(this.startTime, this.endTime, !setValue)];
        }

        let midnightCrossings: moment.Moment[] = [];
        let currentTime: moment.Moment = this.startTime;
        while(currentTime.isBefore(this.endTime)){
            const nextMidnight: moment.Moment = moment(currentTime).startOf('day').add(24, 'hours');
            if(nextMidnight.isBefore(this.endTime)){
                midnightCrossings.push(nextMidnight);
                currentTime = nextMidnight;
            }else{
                currentTime = this.endTime;
            }
        }
        console.log("midnight crossings: " , midnightCrossings)
        this._fullScheduleItems = fullScheduleItems;
        this.splitScheduleAtTimes(midnightCrossings);
        // console.log("thisfullsched", this._fullScheduleItems)
        // console.log("TimeSchedule Class: setting the schedule from values.  IsPositive? " , setValue);
        // this._fullScheduleItems.forEach((item) => {
        //     console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " hasValue? " + item.hasValue)
        // });
    }

    public setScheduleFromFullValues(fullValues: TimeScheduleItem[]) {
        this._fullScheduleItems = fullValues;
    }



    public splitScheduleAtTimes(times: moment.Moment[]) {
        times.forEach((time) => {
            for (let i = 0; i < this.fullScheduleItems.length; i++) {
                if (time.isAfter(this.fullScheduleItems[i].startTime) && time.isBefore(this.fullScheduleItems[i].endTime)) {
                    const splitItems: TimeScheduleItem[] = [
                        new TimeScheduleItem(this.fullScheduleItems[i].startTime, time, this.fullScheduleItems[i].hasValue),
                        new TimeScheduleItem(time, this.fullScheduleItems[i].endTime, this.fullScheduleItems[i].hasValue)
                    ];
                    this._fullScheduleItems.splice(i, 1, ...splitItems);
                    i++;
                }
            }
        });
    }


    public getPreviousValueChangeTime(startTime: moment.Moment, currentValue: boolean = false): moment.Moment {
        let foundIndex = this.fullScheduleItems.findIndex((item) => {
            return startTime.isSameOrAfter(item.startTime) && startTime.isSameOrBefore(item.endTime);
        });
        if (foundIndex >= 0) {
            let foundTime: moment.Moment;
            for (let i = foundIndex; i > 0; i--) {

                if (this.fullScheduleItems[i].hasValue !== currentValue) {
                    foundTime = this.fullScheduleItems[i].startTime;
                    i = 0;
                } else if (i > 0) {
                    if (this.fullScheduleItems[i - 1].hasValue !== currentValue) {
                        foundTime = this.fullScheduleItems[i - 1].endTime;
                        i = 0;
                    }
                }
            }
            if (foundTime) {
                return foundTime
            } else {
                return this.startTime;
            }
        } else {
            console.log('Error: could not find item')
            return startTime;
        }
    }

    public getNextValueChangeTime(currentTime: moment.Moment): moment.Moment {
        if (this.fullScheduleItems.length > 0) {
            let foundItems = this.fullScheduleItems.filter((item) => {
                const crosses = item.startTime.isSameOrBefore(currentTime) && item.endTime.isSameOrAfter(currentTime);
                return crosses || item.startTime.isSameOrAfter(currentTime);
            });
            if (foundItems.length > 0) {
                /**
                 * It is implied that the next item has the opposite value for hasValue (therefore ValueChange)
                 * the next item's startTime is the same as foundItems[0].endTime
                 */
                return foundItems[0].endTime;
            } else {
                return this.endTime;
            }
        } else {
            return this.endTime;
        }
    }
    public getNextValueTrueTime(currentTime: moment.Moment): moment.Moment {
        if (this.hasValueAtTime(currentTime)) {
            return currentTime;
        }
        let foundTime: moment.Moment;
        if (this.fullScheduleItems.length > 0) {
            let foundItems = this.fullScheduleItems.filter((item) => {
                const crosses = item.startTime.isSameOrBefore(currentTime) && item.endTime.isSameOrAfter(currentTime);
                return crosses || item.startTime.isSameOrAfter(currentTime);
            });
            if (foundItems.length > 0) {
                foundItems.forEach((item) => {
                    if (!foundTime) {
                        if (item.hasValue === true) {
                            foundTime = item.startTime;
                        }
                    }
                });
            }
        }
        if (!foundTime) {
            foundTime = this.endTime;
        }
        return foundTime;
    }
    // public getNextValueFalseTime(currentTime: moment.Moment): moment.Moment {
    //     if (!this.hasValueAtTime(currentTime)) {
    //         return currentTime;
    //     }
    //     let foundTime: moment.Moment;
    //     if (this.fullScheduleItems.length > 0) {
    //         let foundItems = this.fullScheduleItems.filter((item) => {
    //             const crosses = item.startTime.isSameOrBefore(currentTime) && item.endTime.isSameOrAfter(currentTime);
    //             return crosses || item.startTime.isSameOrAfter(currentTime);
    //         });
    //         if (foundItems.length > 0) {
    //             foundItems.forEach((item) => {
    //                 if (!foundTime) {
    //                     if (item.hasValue === false) {
    //                         foundTime = item.startTime;
    //                     }
    //                 }
    //             });
    //         }
    //     }
    //     if (!foundTime) {
    //         foundTime = this.endTime;
    //     }
    //     return foundTime;
    // }

    /**
     * It is implied that all (hasValue === true) means positive; not dealing in negatives here.
     * Also, otherSchedule must have same startTime and same endTime as this instance.
     * @param otherSchedule 
     */
    // public mergeValues(otherSchedule: TimeSchedule) {
    //     if (this.startTime.isSame(otherSchedule.startTime) && this.endTime.isSame(otherSchedule.endTime)) {
    //         let freshSchedule: TimeScheduleItem[] = [];
    //         // console.log("Merging values from this schedule and otherSchedule, ", this.fullScheduleItems, otherSchedule.fullScheduleItems)

    //         let sched1: TimeScheduleItem[] = this.fullScheduleItems;
    //         let sched2: TimeScheduleItem[] = otherSchedule.fullScheduleItems;

    //         if (sched1.length > 0 && sched2.length > 0) {
    //             /**
    //              * In this for loop, we search sched1 for each instance of no value.
    //              * in these cases, we search sced2 for value, and insert in place.
    //              */
    //             for (let i = 0; i < sched1.length; i++) {
    //                 if (!sched1[i].hasValue) {
    //                     //if it does not have value, then it is potentially unoccupied, but the other schedule might have value.
    //                     const otherItems = otherSchedule.getScheduleSlice(sched1[i].startTime, sched1[i].endTime);
    //                     freshSchedule.splice(i, 1, ...otherItems.fullScheduleItems);
    //                 } else {
    //                     // if it does have value, then this time is definitely occupied.
    //                     freshSchedule.push(sched1[i]);
    //                 }
    //             }
    //             let mergedSchedule: TimeScheduleItem[] = [];
    //             /**
    //              * In this for loop, we are consolidating the results from the previous loop.
    //              * e.g. item[3].hasValue === true, item[4].hasValue === true, therefore merge 3 & 4.
    //              */
    //             for (let i = 0; i < sched1.length; i++) {
    //                 if (mergedSchedule.length === 0) {
    //                     mergedSchedule.push(sched1[i]);
    //                 } else {
    //                     const originalVal = mergedSchedule[mergedSchedule.length - 1];
    //                     if (originalVal.hasValue === sched1[i].hasValue) {
    //                         mergedSchedule.splice(mergedSchedule.length - 1, 1, new TimeScheduleItem(originalVal.startTime, sched1[i].endTime, originalVal.hasValue));
    //                     } else {
    //                         mergedSchedule.push(sched1[i]);
    //                     }
    //                 }
    //             }
    //             this._fullScheduleItems = mergedSchedule;
    //         } else {
    //             if (sched1.length === 0 && sched2.length > 0) {
    //                 freshSchedule = sched2;
    //             } else if (sched1.length > 0 && sched2.length === 0) {
    //                 freshSchedule = sched1;
    //             } else if (sched1.length === 0 && sched2.length === 0) {
    //                 freshSchedule = [new TimeScheduleItem(this.startTime, this.endTime, false)];
    //             } else {
    //                 freshSchedule = [new TimeScheduleItem(this.startTime, this.endTime, false)];
    //                 console.log("Error with schedules");
    //             }
    //             this._fullScheduleItems = freshSchedule;
    //         }
    //         this._fullScheduleItems = freshSchedule;
    //         // this._fullScheduleItems.forEach((item) => {
    //         //     console.log("   " + item.startTime.format('hh:mm a') + " to " + item.endTime.format('hh:mm a') + " hasValue? " + item.hasValue)
    //         // });
    //     } else {
    //         console.log('Error:  mismatching schedule times.')
    //     }
    // }

    public logFullScheduleItems() {
        console.log("Full Schedule Items: ")
        this._fullScheduleItems.forEach((item) => {
            console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " hasValue? " + item.hasValue)
        });
    }

}



