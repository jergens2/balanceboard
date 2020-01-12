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
        this._fullSchedule = [];
    }

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _fullSchedule: TimeScheduleItem[];

    public get startTime(): moment.Moment { return moment(this._startTime); }
    public get endTime(): moment.Moment { return moment(this._endTime); }


    public get fullSchedule(): TimeScheduleItem[] { return this._fullSchedule; }
    public getScheduleSlice(startTime: moment.Moment, endTime: moment.Moment): TimeSchedule {
        let slicedSchedule: TimeSchedule = new TimeSchedule(startTime, endTime);
        if (this.fullSchedule.length > 0) {
            let foundItems = this.fullSchedule.filter((item) => {
                let crossesStart = item.startTime.isSameOrBefore(startTime) && item.endTime.isAfter(startTime);
                let inBetween = item.startTime.isSameOrAfter(startTime) && item.endTime.isSameOrBefore(endTime);
                let crossesEnd = item.endTime.isBefore(endTime) && item.endTime.isSameOrAfter(startTime);
                return crossesStart || inBetween || crossesEnd;
            }).map((item) => {
                let startTime: moment.Moment, endTime: moment.Moment;
                if (item.startTime.isBefore(startTime)) {
                    startTime = moment(startTime);
                } else {
                    startTime = item.startTime;
                }
                if (item.endTime.isAfter(endTime)) {
                    endTime = moment(endTime);
                } else {
                    endTime = item.endTime;
                }
                return new TimeScheduleItem(startTime, endTime, item.hasValue);
            });
            if(foundItems.length){
                slicedSchedule.setScheduleFromFullValues(foundItems);
            }
        }
        return slicedSchedule;
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
            for(let i=0; i< valueItems.length; i++){
                const itemStart = valueItems[i].startTime;
                const itemEnd = valueItems[i].endTime;
                if(currentTime.isAfter(itemStart)){
                    if(currentTime.isBefore(itemEnd)){
                        fullSchedule.push(new TimeScheduleItem(currentTime, itemEnd, setValue));
                        // console.log("  POOSH: " , new TimeScheduleItem(currentTime, itemEnd, setValue))
                    }
                }else{
                    if(currentTime.isBefore(itemStart)){
                        fullSchedule.push(new TimeScheduleItem(currentTime, itemStart, !setValue));
                        // console.log("  POOSH: " , new TimeScheduleItem(currentTime, itemStart, !setValue))
                    }
                    fullSchedule.push(valueItems[i]);
                    // console.log("  POOSH: " , valueItems[i])
                }
                currentTime = itemEnd;
            }
            if(currentTime.isBefore(this.endTime)){
                fullSchedule.push(new TimeScheduleItem(currentTime, this.endTime, !setValue));
                // console.log("  POOSH: " , new TimeScheduleItem(currentTime, this.endTime, !setValue))
            }else if(currentTime.isAfter(this.endTime)){
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
        //     console.log("   " + item.startTime.format('hh:mm a') + " to " + item.endTime.format('hh:mm a') + " hasValue? " + item.hasValue)
        // });
    }

    public setScheduleFromFullValues(fullValues: TimeScheduleItem[]) {
        this._fullSchedule = fullValues;
    }



    public splitScheduleAtTimes(times: moment.Moment[]){
        times.forEach((time)=>{
            for(let i=0; i<this.fullSchedule.length; i++){
                if(time.isAfter(this.fullSchedule[i].startTime) && time.isBefore(this.fullSchedule[i].endTime)){
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
    public getNextValueFalseTime(currentTime: moment.Moment): moment.Moment {
        if (!this.hasValueAtTime(currentTime)) {
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
                        if (item.hasValue === false) {
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
                for(let i=0; i<sched1.length;i++){
                    if(!sched1[i].hasValue){
                        const otherItems = otherSchedule.getScheduleSlice(sched1[i].startTime, sched1[i].endTime);
                        freshSchedule.splice(i, 1, ...otherItems.fullSchedule);
                    }else{
                        freshSchedule.push(sched1[i]);
                    }
                }
                let mergedSchedule :TimeScheduleItem[] = [];
                for(let i=0; i<sched1.length;i++){
                    if(mergedSchedule.length === 0){
                        mergedSchedule.push(sched1[i]);
                    }else{
                        const originalVal = mergedSchedule[mergedSchedule.length-1];
                        if(originalVal.hasValue === sched1[i].hasValue){
                            mergedSchedule.splice(mergedSchedule.length-1, 1, new TimeScheduleItem(originalVal.startTime, sched1[i].endTime, originalVal.hasValue));
                        }else{
                            mergedSchedule.push(sched1[i]);
                        }
                    }
                }
                freshSchedule = mergedSchedule;
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
            }
            // console.log("Merge complete: ")
            this._fullSchedule = freshSchedule;
            // this._fullSchedule.forEach((item) => {
            //     console.log("   " + item.startTime.format('hh:mm a') + " to " + item.endTime.format('hh:mm a') + " hasValue? " + item.hasValue)
            // });
        } else {
            console.log('Error:  mismatching schedule times.')
        }
    }

}



