import * as moment from 'moment';
import { TimeScheduleItem } from './time-schedule-item.class';


export class TimeSchedule<T>{

    /**
     *  The TimeSchedule class is a class that keeps track of a congruous table of time, with some property associated with each block.
     *  Currently only performs this functionality for a single bool value property.
     */
    constructor(startTime: moment.Moment, endTime: moment.Moment) { this._reconstructSchedule(startTime, endTime); }


    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _fullScheduleItems: TimeScheduleItem<T>[];
    private _valueItems: TimeScheduleItem<T>[] = [];

    public get startTime(): moment.Moment { return moment(this._startTime); }
    public get endTime(): moment.Moment { return moment(this._endTime); }


    public addScheduleValueItems(items: TimeScheduleItem<T>[]) {
        items.forEach((item) => {
            this._addScheduleValueItem(item);
        });
    }



    public get valueItems(): TimeScheduleItem<T>[] { return this._valueItems; }
    public get fullScheduleItems(): TimeScheduleItem<T>[] { return this._fullScheduleItems; }


    public getScheduleSlice(startTime: moment.Moment, endTime: moment.Moment): TimeScheduleItem<T>[] {
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
                let newTimeScheduleFullItems: TimeScheduleItem<T>[] = [];
                if (foundSliceItems.length === 1) {
                    newTimeScheduleFullItems = [foundSliceItems[0]];
                } else {
                    for (let i = 0; i < foundSliceItems.length; i++) {
                        if (foundSliceItems[i].endTime.isSameOrBefore(endTime)) {
                            newTimeScheduleFullItems.push(new TimeScheduleItem<T>(currentTime, foundSliceItems[i].endTime, foundSliceItems[i].hasValue, foundSliceItems[i].value));
                        } else if (foundSliceItems[i].endTime.isAfter(endTime)) {
                            newTimeScheduleFullItems.push(new TimeScheduleItem<T>(currentTime, endTime, foundSliceItems[i].hasValue, foundSliceItems[i].value));
                        }
                        currentTime = foundSliceItems[i].endTime;
                    }
                }
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
        if (this.valueItems.length > 0) {
            let foundItem = this.valueItems.find((item) => {
                return timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isSameOrBefore(item.endTime);
            });
            if (foundItem) {
                return foundItem.hasValue;
            } else {
                // console.log(' Error:  could not find item in schedule.')
                return false;
            }
        } else {
            return false;
        }
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


    /** */

    protected _reconstructSchedule(startTime, endTime){
        this._startTime = startTime;
        this._endTime = endTime;
        this._valueItems = [];
        this._reOrganizeSchedule();
    }
    protected _reOrganizeSchedule() {
        // console.log("**** REBUILDING THE SCHEDULE")
        this._sortValueItems();
        if (this._valueItems.length > 0) {
            
            let currentTime: moment.Moment = moment(this._startTime);
            let fullScheduleItems: TimeScheduleItem<T>[] = [];
            for (let i = 0; i < this._valueItems.length; i++) {
                const vi = this._valueItems[i];
                if (currentTime.isSame(vi.startTime)) {
                } else if (currentTime.isAfter(vi.startTime)) {
                    console.log('Error: this shouldnt ever happen.  Please check this._sortValueItems() method.');
                } else if (currentTime.isBefore(vi.startTime)) {
                    fullScheduleItems.push(new TimeScheduleItem(currentTime, vi.startTime, false, null));
                    
                }
                fullScheduleItems.push(vi);
                currentTime = moment(vi.endTime);
            }
            this._fullScheduleItems = fullScheduleItems;
        } else {
            this._fullScheduleItems = [new TimeScheduleItem<T>(this.startTime, this.endTime, false, null)]
        }
        // console.log("TimeSchedule has been rebuilt.  fullItems, valueItems: ", this._fullScheduleItems, this._valueItems);
        // console.log("  FullScheduleItems:")
        // this._fullScheduleItems.forEach((item) => {
        //     console.log("    " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " : " + item.hasValue, item.value)
        // })
        // console.log("  ValueItems:")
        // this._valueItems.forEach((item) => {
        //     console.log("    " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " : " + item.hasValue, item.value)
        // })
    }

    private _sortValueItems() {
        this._valueItems = this._valueItems.sort((item1, item2)=>{
            if(item1.startTime.isBefore(item2.startTime)){
                return -1;
            }else if(item1.startTime.isAfter(item2.startTime)){
                return 1;
            }else{
                return 0;
            }
        })
        if (this._valueItems.length > 1) {
            for (let i = 1; i < this._valueItems.length; i++) {
                const currentItem = this._valueItems[i];
                const prevItem = this._valueItems[i - 1];
                const isInside = currentItem.startTime.isSameOrAfter(prevItem.startTime) && currentItem.endTime.isSameOrBefore(prevItem.endTime);
                const crossesStart = currentItem.startTime.isBefore(prevItem.startTime) && currentItem.endTime.isAfter(prevItem.startTime);
                const crossesEnd = currentItem.startTime.isBefore(prevItem.endTime) && currentItem.endTime.isAfter(prevItem.endTime);
                const encompasses = currentItem.startTime.isSameOrBefore(prevItem.startTime) && currentItem.endTime.isSameOrAfter(prevItem.endTime);

                if (isInside) {
                    // console.log("   ITS INSIDE")
                    if (currentItem.priority > prevItem.priority) {
                        let newItems: TimeScheduleItem<T>[] = [];
                        if (currentItem.startTime.isSameOrBefore(prevItem.startTime)) {
                            newItems.push(currentItem)
                        } else if (currentItem.startTime.isAfter(prevItem.startTime)) {
                            newItems.push(new TimeScheduleItem(prevItem.startTime, currentItem.startTime, true, prevItem.value));
                            newItems.push(currentItem);
                        }
                        if (prevItem.endTime.isAfter(currentItem.endTime)) {
                            newItems.push(new TimeScheduleItem(currentItem.endTime, prevItem.endTime, true, prevItem.value));
                        }
                        this._valueItems.splice(i - 1, 2, ...newItems)
                    } else {
                        this._valueItems.splice(i);
                        i--;
                    }
                } else if (crossesStart) {
                    // console.log("   IT CROSSES START")
                    if (currentItem.priority > prevItem.priority) {
                        if (currentItem.endTime.isBefore(prevItem.endTime)) {
                            this._valueItems[i - 1].startTime = moment(currentItem.endTime);
                        } else {
                            this._valueItems.splice(i - 1);
                            i--
                        }
                    } else {
                        currentItem.endTime = moment(prevItem.startTime);
                    }
                } else if (crossesEnd) {
                    // console.log("   IT CROSSES END")
                    if (currentItem.priority > prevItem.priority) {
                        prevItem.endTime = moment(currentItem.startTime);
                    } else {
                        currentItem.startTime = moment(prevItem.endTime);
                    }
                } else if (encompasses) {
                    // console.log("   ITS AN ENCOMPASSING MOSNTER")
                    if (currentItem.priority > prevItem.priority) {
                        this._valueItems.splice(i - 1);
                        i--;
                    } else {
                        let newItems: TimeScheduleItem<T>[] = [
                            new TimeScheduleItem<T>(currentItem.startTime, prevItem.startTime, true, currentItem.value),
                            new TimeScheduleItem<T>(prevItem.startTime, prevItem.endTime, true, prevItem.value),
                            new TimeScheduleItem<T>(prevItem.endTime, currentItem.endTime, true, currentItem.value),
                        ];
                        this._valueItems.splice(i - 1, 2, ...newItems)
                    }
                }else{
                    // console.log("   ITS NONE OF THESE THINGS")
                }
            }
        }


        
    }

    private _addScheduleValueItem(item: TimeScheduleItem<T>, overRide: boolean = false) {
        const isInside = item.startTime.isSameOrAfter(this.startTime) && item.endTime.isSameOrBefore(this.endTime);
        const startsBefore = item.startTime.isBefore(this.startTime) && item.endTime.isSameOrBefore(this.endTime);
        const endsAfter = item.startTime.isSameOrAfter(this.startTime) && item.endTime.isAfter(this.endTime);
        const encompasses = item.startTime.isSameOrBefore(this.startTime) && item.endTime.isSameOrAfter(this.endTime);
        if (isInside || startsBefore || endsAfter || encompasses) {
            // let itemStart: moment.Moment = item.startTime;
            // let itemEnd: moment.Moment = item.endTime;
            // if (startsBefore || encompasses) { itemStart = this.startTime; }
            // if (endsAfter || encompasses) { itemEnd = this.endTime; }

            // if (this.hasValueAtTime(moment(itemStart).add(1, 'millisecond')) || this.hasValueAtTime(moment(itemEnd).subtract(1, 'millisecond'))) {
            //     if (overRide === true) {
            //         this._setOverridePriority(item);
            //     } else {
            //         this._setLowPriority(item);
            //     }
            // }
            this._valueItems.push(item);
            this._reOrganizeSchedule();
        } else {
            console.log('Error: Item was not added to time schedule because it was not in range')
        }
    }

    // private _setLowPriority(item: TimeScheduleItem<T>) {
    //     this._valueItems.forEach((item) => {
    //         item.priority++;
    //     });
    //     item.priority = 0;
    // }

    // private _setOverridePriority(item: TimeScheduleItem<T>) {
    //     let maxPriority: number = 0;
    //     this._valueItems.forEach((item) => {
    //         if (item.priority > maxPriority) {
    //             maxPriority = item.priority;
    //         }
    //     });
    //     item.priority = maxPriority + 1;
    // }

    
    public logFullScheduleItems() {
        console.log("Full Schedule Items: ")
        this._fullScheduleItems.forEach((item) => {
            console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " hasValue? " + item.hasValue + " -- " + item.value)
        });
    }

}



