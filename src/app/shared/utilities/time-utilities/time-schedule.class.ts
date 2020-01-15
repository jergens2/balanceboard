import * as moment from 'moment';
import { TimeScheduleItem } from './time-schedule-item.class';


export class TimeSchedule {

    /**
     *  The TimeSchedule class is a class that keeps track of a congruous table of time, with some property associated with each block.
     *  Currently only performs this functionality for a single bool value property.
     */
    constructor(startTime: moment.Moment, endTime: moment.Moment) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._fullSchedule = [new TimeScheduleItem(startTime, endTime, false)];
    }

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _fullSchedule: TimeScheduleItem[];

    public get startTime(): moment.Moment { return moment(this._startTime); }
    public get endTime(): moment.Moment { return moment(this._endTime); }


    public get fullSchedule(): TimeScheduleItem[] { return this._fullSchedule; }
    public getScheduleSlice(startTime: moment.Moment, endTime: moment.Moment): TimeSchedule {
        // console.log("   Finding slice: " + startTime.format('YYYY-MM-DD hh:mm a') + " to " + endTime.format('YYYY-MM-DD hh:mm a') ) 
        if (startTime.isSameOrAfter(this.startTime) && endTime.isSameOrBefore(this.endTime)) {
            let slicedSchedule: TimeSchedule = new TimeSchedule(startTime, endTime);
            let foundSliceItems = this.fullSchedule.filter((item) => {
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
                slicedSchedule.setScheduleFromFullValues(newTimeScheduleFullItems);
                // console.log("Returning Sliced Schedule:");
                // slicedSchedule.fullSchedule.forEach((item) => {
                //     console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a'), item.hasValue)
                // })
                return slicedSchedule;
            } else {
                console.log("No slice found.  returning empty schedule.")
                return new TimeSchedule(startTime, endTime);
            }
        } else {
            console.log("No slice found.  returning empty schedule.")
            return new TimeSchedule(startTime, endTime);
        }
    }
    public hasValueAtTime(timeToCheck: moment.Moment): boolean {
        if (this.fullSchedule.length > 0) {
            let foundItem = this._fullSchedule.find((item) => {
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
        let fullSchedule: TimeScheduleItem[] = [];
        if (valueItems.length > 0) {
            let currentTime = this.startTime;
            for (let i = 0; i < valueItems.length; i++) {
                const itemStart = valueItems[i].startTime;
                const itemEnd = valueItems[i].endTime;
                if (currentTime.isAfter(itemStart)) {
                    if (currentTime.isBefore(itemEnd)) {
                        fullSchedule.push(new TimeScheduleItem(currentTime, itemEnd, setValue));
                        // console.log("  POOSH: " , new TimeScheduleItem(currentTime, itemEnd, setValue))
                    }
                } else {
                    if (currentTime.isBefore(itemStart)) {
                        fullSchedule.push(new TimeScheduleItem(currentTime, itemStart, !setValue));
                        // console.log("  POOSH: " , new TimeScheduleItem(currentTime, itemStart, !setValue))
                    }
                    fullSchedule.push(valueItems[i]);
                    // console.log("  POOSH: " , valueItems[i])
                }
                currentTime = itemEnd;
            }
            if (currentTime.isBefore(this.endTime)) {
                fullSchedule.push(new TimeScheduleItem(currentTime, this.endTime, !setValue));
                // console.log("  POOSH: " , new TimeScheduleItem(currentTime, this.endTime, !setValue))
            } else if (currentTime.isAfter(this.endTime)) {
                console.log('Error with items');
            }
            // console.log("full schedule: " , fullSchedule)
        } else {
            fullSchedule = [new TimeScheduleItem(this.startTime, this.endTime, !setValue)];
        }
        // console.log("full schedule: " , fullSchedule)
        this._fullSchedule = fullSchedule;
        // console.log("thisfullsched", this._fullSchedule)
        // console.log("TimeSchedule Class: setting the schedule from values.  IsPositive? " , setValue);
        // this._fullSchedule.forEach((item) => {
        //     console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " hasValue? " + item.hasValue)
        // });
    }

    public setScheduleFromFullValues(fullValues: TimeScheduleItem[]) {
        this._fullSchedule = fullValues;
    }



    public splitScheduleAtTimes(times: moment.Moment[]) {
        times.forEach((time) => {
            for (let i = 0; i < this.fullSchedule.length; i++) {
                if (time.isAfter(this.fullSchedule[i].startTime) && time.isBefore(this.fullSchedule[i].endTime)) {
                    const splitItems: TimeScheduleItem[] = [
                        new TimeScheduleItem(this.fullSchedule[i].startTime, time, this.fullSchedule[i].hasValue),
                        new TimeScheduleItem(time, this.fullSchedule[i].endTime, this.fullSchedule[i].hasValue)
                    ];
                    this._fullSchedule.splice(i, 1, ...splitItems);
                    i++;
                }
            }
        });
    }


    public getPreviousValueChangeTime(startTime: moment.Moment, currentValue: boolean = false): moment.Moment {
        let foundIndex = this.fullSchedule.findIndex((item) => {
            return startTime.isSameOrAfter(item.startTime) && startTime.isSameOrBefore(item.endTime);
        });
        if (foundIndex >= 0) {
            let foundTime: moment.Moment;
            for (let i = foundIndex; i > 0; i--) {

                if(this.fullSchedule[i].hasValue !== currentValue){
                    foundTime = this.fullSchedule[i].startTime;
                    i = 0;
                }else if(i > 0){
                    if(this.fullSchedule[i-1].hasValue !== currentValue){
                        foundTime = this.fullSchedule[i-1].endTime;
                        i=0;
                    }
                }
            }
            if(foundTime){
                return foundTime
            }else{
                return this.startTime;   
            }
        } else {
            console.log('Error: could not find item')
            return startTime;
        }
    }

    public getNextValueChangeTime(currentTime: moment.Moment): moment.Moment {
        if (this.fullSchedule.length > 0) {
            let foundItems = this.fullSchedule.filter((item) => {
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
        if (this.fullSchedule.length > 0) {
            let foundItems = this.fullSchedule.filter((item) => {
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
    //     if (this.fullSchedule.length > 0) {
    //         let foundItems = this.fullSchedule.filter((item) => {
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
    public mergeValues(otherSchedule: TimeSchedule) {
        if (this.startTime.isSame(otherSchedule.startTime) && this.endTime.isSame(otherSchedule.endTime)) {
            let freshSchedule: TimeScheduleItem[] = [];
            // console.log("Merging values from this schedule and otherSchedule, ", this.fullSchedule, otherSchedule.fullSchedule)

            let sched1: TimeScheduleItem[] = this.fullSchedule;
            let sched2: TimeScheduleItem[] = otherSchedule.fullSchedule;

            if (sched1.length > 0 && sched2.length > 0) {
                /**
                 * In this for loop, we search sched1 for each instance of no value.
                 * in these cases, we search sced2 for value, and insert in place.
                 */
                for (let i = 0; i < sched1.length; i++) {
                    if (!sched1[i].hasValue) {
                        //if it does not have value, then it is potentially unoccupied, but the other schedule might have value.
                        const otherItems = otherSchedule.getScheduleSlice(sched1[i].startTime, sched1[i].endTime);
                        freshSchedule.splice(i, 1, ...otherItems.fullSchedule);
                    } else {
                        // if it does have value, then this time is definitely occupied.
                        freshSchedule.push(sched1[i]);
                    }
                }
                let mergedSchedule: TimeScheduleItem[] = [];
                /**
                 * In this for loop, we are consolidating the results from the previous loop.
                 * e.g. item[3].hasValue === true, item[4].hasValue === true, therefore merge 3 & 4.
                 */
                for (let i = 0; i < sched1.length; i++) {
                    if (mergedSchedule.length === 0) {
                        mergedSchedule.push(sched1[i]);
                    } else {
                        const originalVal = mergedSchedule[mergedSchedule.length - 1];
                        if (originalVal.hasValue === sched1[i].hasValue) {
                            mergedSchedule.splice(mergedSchedule.length - 1, 1, new TimeScheduleItem(originalVal.startTime, sched1[i].endTime, originalVal.hasValue));
                        } else {
                            mergedSchedule.push(sched1[i]);
                        }
                    }
                }
                this._fullSchedule = mergedSchedule;
            } else {
                if (sched1.length === 0 && sched2.length > 0) {
                    freshSchedule = sched2;
                } else if (sched1.length > 0 && sched2.length === 0) {
                    freshSchedule = sched1;
                } else if (sched1.length === 0 && sched2.length === 0) {
                    freshSchedule = [new TimeScheduleItem(this.startTime, this.endTime, false)];
                } else {
                    freshSchedule = [new TimeScheduleItem(this.startTime, this.endTime, false)];
                    console.log("Error with schedules");
                }
                this._fullSchedule = freshSchedule;
            }
            this._fullSchedule = freshSchedule;
            // this._fullSchedule.forEach((item) => {
            //     console.log("   " + item.startTime.format('hh:mm a') + " to " + item.endTime.format('hh:mm a') + " hasValue? " + item.hasValue)
            // });
        } else {
            console.log('Error:  mismatching schedule times.')
        }
    }

}



